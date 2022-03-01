package umm3601.user;

import static com.mongodb.client.model.Filters.eq;
import static io.javalin.plugin.json.JsonMapperKt.JSON_MAPPER_KEY;
import static java.util.Map.entry;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.core.JavalinConfig;
import io.javalin.core.validation.ValidationException;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HandlerType;
import io.javalin.http.HttpCode;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJackson;

/**
 * Tests the logic of the UserController
 *
 * @throws IOException
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({ "MagicNumber" })
public class UserControllerSpec {

  // Mock requests and responses that will be reset in `setupEach()`
  // and then (re)used in each of the tests.
  private MockHttpServletRequest mockReq = new MockHttpServletRequest();
  private MockHttpServletResponse mockRes = new MockHttpServletResponse();

  // An instance of the controller we're testing that is prepared in
  // `setupEach()`, and then exercised in the various tests below.
  private UserController userController;

  // A Mongo object ID that is initialized in `setupEach()` and used
  // in a few of the tests. It isn't used all that often, though,
  // which suggests that maybe we should extract the tests that
  // care about it into their own spec file?
  private ObjectId samsId;

  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;

  // Used to translate between JSON and POJOs.
  private static JavalinJackson javalinJackson = new JavalinJackson();

  /**
   * Sets up (the connection to the) DB once; that connection and DB will
   * then be (re)used for all the tests, and closed in the `teardown()`
   * method. It's somewhat expensive to establish a connection to the
   * database, and there are usually limits to how many connections
   * a database will support at once. Limiting ourselves to a single
   * connection that will be shared across all the tests in this spec
   * file helps both speed things up and reduce the load on the DB
   * engine.
   */
  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build()
    );
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  public void setupEach() throws IOException {
    // Reset our mock request and response objects
    mockReq.resetAll();
    mockRes.resetAll();

    // Setup database
    MongoCollection<Document> userDocuments = db.getCollection("users");
    userDocuments.drop();
    List<Document> testUsers = new ArrayList<>();
    testUsers.add(
        new Document()
            .append("name", "Chris")
            .append("age", 25)
            .append("company", "UMM")
            .append("email", "chris@this.that")
            .append("role", "admin")
            .append("avatar", "https://gravatar.com/avatar/8c9616d6cc5de638ea6920fb5d65fc6c?d=identicon"));
    testUsers.add(
        new Document()
            .append("name", "Pat")
            .append("age", 37)
            .append("company", "IBM")
            .append("email", "pat@something.com")
            .append("role", "editor")
            .append("avatar", "https://gravatar.com/avatar/b42a11826c3bde672bce7e06ad729d44?d=identicon"));
    testUsers.add(
        new Document()
            .append("name", "Jamie")
            .append("age", 37)
            .append("company", "OHMNET")
            .append("email", "jamie@frogs.com")
            .append("role", "viewer")
            .append("avatar", "https://gravatar.com/avatar/d4a6c71dd9470ad4cf58f78c100258bf?d=identicon"));

    samsId = new ObjectId();
    Document sam = new Document()
        .append("_id", samsId)
        .append("name", "Sam")
        .append("age", 45)
        .append("company", "OHMNET")
        .append("email", "sam@frogs.com")
        .append("role", "viewer")
        .append("avatar", "https://gravatar.com/avatar/08b7610b558a4cbbd20ae99072801f4d?d=identicon");

    userDocuments.insertMany(testUsers);
    userDocuments.insertOne(sam);

    userController = new UserController(db);
  }

  /**
   * Construct an instance of `Context` using `ContextUtil`, providing
   * a mock context in Javalin. See `mockContext(String, Map)` for
   * more details.
   */
  private Context mockContext(String path) {
    return mockContext(path, Collections.emptyMap());
  }

  /**
   * Construct an instance of `Context` using `ContextUtil`, providing a mock
   * context in Javalin. We need to provide a couple of attributes, which is
   * the fifth argument, which forces us to also provide the (default) value
   * for the fourth argument. There are two attributes we need to provide:
   *
   *   - One is a `JsonMapper` that is used to translate between POJOs and JSON
   *     objects. This is needed by almost every test.
   *   - The other is `maxRequestSize`, which is needed for all the ADD requests,
   *     since `ContextUtil` checks to make sure that the request isn't "too big".
   *     Those tests fails if you don't provide a value for `maxRequestSize` for
   *     it to use in those comparisons.
   */
  private Context mockContext(String path, Map<String, String> pathParams) {
    return ContextUtil.init(
        mockReq, mockRes,
        path,
        pathParams,
        HandlerType.INVALID,
        Map.ofEntries(
          entry(JSON_MAPPER_KEY, javalinJackson),
          entry(ContextUtil.maxRequestSizeKey,
                new JavalinConfig().maxRequestSize
          )
        )
      );
  }

  /**
   * A little helper method that assumes that the given context
   * body contains an array of Users, and extracts and returns
   * that array.
   *
   * @param ctx the `Context` whose body is assumed to contain
   *  an array of `User`s.
   * @return the array of `User`s from the given `Context`.
   */
  private User[] returnedUsers(Context ctx) {
    String result = ctx.resultString();
    User[] users = javalinJackson.fromJsonString(result, User[].class);
    return users;
  }

  /**
   * A little helper method that assumes that the given context
   * body contains a *single* User, and extracts and returns
   * that User.
   *
   * @param ctx the `Context` whose body is assumed to contain
   *  a *single* `User`.
   * @return the `User` extracted from the given `Context`.
   */
  private User returnedSingleUser(Context ctx) {
    String result = ctx.resultString();
    User user = javalinJackson.fromJsonString(result, User.class);
    return user;
  }

  @Test
  public void canGetAllUsers() throws IOException {
    // Create our fake Javalin context
    String path = "api/users";
    Context ctx = mockContext(path);

    userController.getUsers(ctx);
    User[] returnedUsers = returnedUsers(ctx);

    // The response status should be 200, i.e., our request
    // was handled successfully (was OK). This is a named constant in
    // the class HttpCode.
    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(
      db.getCollection("users").countDocuments(),
      returnedUsers.length
    );
  }

  @Test
  public void canGetUsersWithAge37() throws IOException {
    // Set the query string to test with
    mockReq.setQueryString("age=37");
    // Create our fake Javalin context
    Context ctx = mockContext("api/users");

    userController.getUsers(ctx);
    User[] resultUsers = returnedUsers(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(2, resultUsers.length); // There should be two users returned
    for (User user : resultUsers) {
      assertEquals(37, user.age); // Every user should be age 37
    }
  }

  /**
   * Test that if the user sends a request with an illegal value in
   * the age field (i.e., something that can't be parsed to a number)
   * we get a reasonable error code back.
   */
  @Test
  public void respondsAppropriatelyToNonNumericAge() {

    mockReq.setQueryString("age=abc");
    Context ctx = mockContext("api/users");

    // This should now throw a `ValidationException` because
    // our request has an age that can't be parsed to a number.
    assertThrows(ValidationException.class, () -> {
      userController.getUsers(ctx);
    });
  }

  @Test
  public void canGetUsersWithCompany() throws IOException {
    mockReq.setQueryString("company=OHMNET");
    Context ctx = mockContext("api/users");

    userController.getUsers(ctx);
    User[] resultUsers = returnedUsers(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(2, resultUsers.length); // There should be two users returned
    for (User user : resultUsers) {
      assertEquals("OHMNET", user.company);
    }
  }

  @Test
  public void getUsersByRole() throws IOException {
    mockReq.setQueryString("role=viewer");
    Context ctx = mockContext("api/users");

    userController.getUsers(ctx);
    User[] resultUsers = returnedUsers(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(2, resultUsers.length);
    for (User user : resultUsers) {
      assertEquals("viewer", user.role);
    }
  }

  @Test
  public void getUsersByCompanyAndAge() throws IOException {
    mockReq.setQueryString("company=OHMNET&age=37");
    Context ctx = mockContext("api/users");

    userController.getUsers(ctx);
    User[] resultUsers = returnedUsers(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(1, resultUsers.length);
    for (User user : resultUsers) {
      assertEquals("OHMNET", user.company);
      assertEquals(37, user.age);
    }
  }

  @Test
  public void getUserWithExistentId() throws IOException {
    String testID = samsId.toHexString();
    Context ctx = mockContext("api/users/{id}", Map.of("id", testID));

    userController.getUser(ctx);
    User resultUser = returnedSingleUser(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(samsId.toHexString(), resultUser._id);
    assertEquals("Sam", resultUser.name);
  }

  @Test
  public void getUserWithBadId() throws IOException {
    Context ctx = mockContext("api/users/{id}", Map.of("id", "bad"));

    assertThrows(BadRequestResponse.class, () -> {
      userController.getUser(ctx);
    });
  }

  @Test
  public void getUserWithNonexistentId() throws IOException {
    Context ctx = mockContext("api/users/{id}", Map.of("id", "58af3a600343927e48e87335"));

    assertThrows(NotFoundResponse.class, () -> {
      userController.getUser(ctx);
    });
  }

  @Test
  public void addUser() throws IOException {

    String testNewUser = "{"
        + "\"name\": \"Test User\","
        + "\"age\": 25,"
        + "\"company\": \"testers\","
        + "\"email\": \"test@example.com\","
        + "\"role\": \"viewer\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    userController.addNewUser(ctx);
    String result = ctx.resultString();
    String id = javalinJackson.fromJsonString(result, ObjectNode.class).get("id").asText();

    // Our status should be 201, i.e., our new user was successfully
    // created. This is a named constant in the class HttpURLConnection.
    assertEquals(HttpURLConnection.HTTP_CREATED, mockRes.getStatus());

    // Successfully adding the user should return the newly generated MongoDB ID
    // for that user.
    assertNotEquals("", id);
    assertEquals(1, db.getCollection("users").countDocuments(eq("_id", new ObjectId(id))));

    // Verify that the user was added to the database with the correct ID
    Document addedUser = db.getCollection("users").find(eq("_id", new ObjectId(id))).first();

    assertNotNull(addedUser);
    assertEquals("Test User", addedUser.getString("name"));
    assertEquals(25, addedUser.getInteger("age"));
    assertEquals("testers", addedUser.getString("company"));
    assertEquals("test@example.com", addedUser.getString("email"));
    assertEquals("viewer", addedUser.getString("role"));
    assertTrue(addedUser.containsKey("avatar"));
  }

  @Test
  public void addInvalidEmailUser() throws IOException {
    String testNewUser = "{"
        + "\"name\": \"Test User\","
        + "\"age\": 25,"
        + "\"company\": \"testers\","
        + "\"email\": \"invalidemail\","
        + "\"role\": \"viewer\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    assertThrows(ValidationException.class, () -> {
      userController.addNewUser(ctx);
    });
  }

  @Test
  public void addInvalidAgeUser() throws IOException {
    String testNewUser = "{"
        + "\"name\": \"Test User\","
        + "\"age\": \"notanumber\","
        + "\"company\": \"testers\","
        + "\"email\": \"test@example.com\","
        + "\"role\": \"viewer\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    assertThrows(ValidationException.class, () -> {
      userController.addNewUser(ctx);
    });
  }

  @Test
  public void add0AgeUser() throws IOException {
    String testNewUser = "{"
        + "\"name\": \"Test User\","
        + "\"age\": 0,"
        + "\"company\": \"testers\","
        + "\"email\": \"test@example.com\","
        + "\"role\": \"viewer\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    assertThrows(ValidationException.class, () -> {
      userController.addNewUser(ctx);
    });
  }

  @Test
  public void addNullNameUser() throws IOException {
    String testNewUser = "{"
        + "\"age\": 25,"
        + "\"company\": \"testers\","
        + "\"email\": \"test@example.com\","
        + "\"role\": \"viewer\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    assertThrows(ValidationException.class, () -> {
      userController.addNewUser(ctx);
    });
  }

  @Test
  public void addInvalidNameUser() throws IOException {
    String testNewUser = "{"
        + "\"name\": \"\","
        + "\"age\": 25,"
        + "\"company\": \"testers\","
        + "\"email\": \"test@example.com\","
        + "\"role\": \"viewer\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    assertThrows(ValidationException.class, () -> {
      userController.addNewUser(ctx);
    });
  }

  @Test
  public void addInvalidRoleUser() throws IOException {
    String testNewUser = "{"
        + "\"name\": \"Test User\","
        + "\"age\": 25,"
        + "\"company\": \"testers\","
        + "\"email\": \"test@example.com\","
        + "\"role\": \"invalidrole\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    assertThrows(ValidationException.class, () -> {
      userController.addNewUser(ctx);
    });
  }

  @Test
  public void addNullCompanyUser() throws IOException {
    String testNewUser = "{"
        + "\"name\": \"Test User\","
        + "\"age\": 25,"
        + "\"email\": \"test@example.com\","
        + "\"role\": \"viewer\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    assertThrows(ValidationException.class, () -> {
      userController.addNewUser(ctx);
    });
  }

  @Test
  public void addInvalidCompanyUser() throws IOException {
    String testNewUser = "{"
        + "\"name\": \"\","
        + "\"age\": 25,"
        + "\"company\": \"\","
        + "\"email\": \"test@example.com\","
        + "\"role\": \"viewer\""
        + "}";
    mockReq.setBodyContent(testNewUser);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/users");

    assertThrows(ValidationException.class, () -> {
      userController.addNewUser(ctx);
    });
  }

  @Test
  public void deleteUser() throws IOException {
    String testID = samsId.toHexString();

    // User exists before deletion
    assertEquals(1, db.getCollection("users").countDocuments(eq("_id", new ObjectId(testID))));

    Context ctx = mockContext("api/users/{id}", Map.of("id", testID));

    userController.deleteUser(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());

    // User is no longer in the database
    assertEquals(0, db.getCollection("users").countDocuments(eq("_id", new ObjectId(testID))));
  }

}
