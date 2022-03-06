package umm3601.pantry;

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
 * Tests the logic of the PantryController
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
public class PantryControllerSpec {

  // Mock requests and responses that will be reset in `setupEach()`
  // and then (re)used in each of the tests.
  private MockHttpServletRequest mockReq = new MockHttpServletRequest();
  private MockHttpServletResponse mockRes = new MockHttpServletResponse();

  // An instance of the controller we're testing that is prepared in
  // `setupEach()`, and then exercised in the various tests below.
  private PantryController pantryController;

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
    MongoCollection<Document> pantryDocuments = db.getCollection("pantry");
    pantryDocuments.drop();
    List<Document> testPantry = new ArrayList<>();
    testPantry.add(
        new Document()
            .append("prodID", "588935f5")
            .append("name", "apple")
            .append("date", "1/20/2022")
            .append("notes", "yummy"));
    testPantry.add(
        new Document()
        .append("prodID", "6f992bf")
        .append("name", "Banana")
        .append("date", "2/20/2022")
        .append("notes", "good source of potassium"));
    testPantry.add(
        new Document()
        .append("prodID", "8f37c")
          .append("name", "PORK LOIN")
          .append("date", "1/30/2022")
          .append("notes", "goods oup"));
    samsId = new ObjectId();
    Document sam = new Document()
        .append("_id", samsId)
        .append("prodID", "f992bf8f37c01")
        .append("name", "corn FLAKEs")
        .append("date", "5/20/2020")
        .append("notes", "lmao");
    pantryDocuments.insertMany(testPantry);
    pantryDocuments.insertOne(sam);

    pantryController = new PantryController(db);
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
   * body contains an array of Pantry, and extracts and returns
   * that array.
   *
   * @param ctx the `Context` whose body is assumed to contain
   *  an array of `Pantry`s.
   * @return the array of `Pantry`s from the given `Context`.
   */
  private Pantry[] returnedPantry(Context ctx) {
    String result = ctx.resultString();
    Pantry[] pantry = javalinJackson.fromJsonString(result, Pantry[].class);
    return pantry;
  }

  /**
   * A little helper method that assumes that the given context
   * body contains a *single* Pantry, and extracts and returns
   * that Pantry.
   *
   * @param ctx the `Context` whose body is assumed to contain
   *  a *single* `Pantry`.
   * @return the `Pantry` extracted from the given `Context`.
   */
  private Pantry returnedSinglePantryItem(Context ctx) {
    String result = ctx.resultString();
    Pantry pantry = javalinJackson.fromJsonString(result, Pantry.class);
    return pantry;
  }

  @Test
  public void canGetAllPantryItems() throws IOException {
    // Create our fake Javalin context
    String path = "api/pantry";
    Context ctx = mockContext(path);

    pantryController.getPantrys(ctx);
    Pantry[] returnedPantry = returnedPantry(ctx);

    // The response status should be 200, i.e., our request
    // was handled successfully (was OK). This is a named constant in
    // the class HttpCode.
    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(
      db.getCollection("pantry").countDocuments(),
      returnedPantry.length
    );
  }

  @Test
  public void canGetPantryItemsByName() throws IOException {
    mockReq.setQueryString("name=pork loin");
    Context ctx = mockContext("api/pantry");

    pantryController.getPantrys(ctx);
    Pantry[] resultPantry = returnedPantry(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(1, resultPantry.length); // There should be two pantry returned
    for (Pantry pantry : resultPantry) {
      assertEquals("PORK LOIN", pantry.name);
    }
  }



  @Test
  public void getPantryByNameAndNotes() throws IOException {
    mockReq.setQueryString("name=corn FLAKEs&notes=lmao");
    Context ctx = mockContext("api/pantry");

    pantryController.getPantrys(ctx);
    Pantry[] resultPantry = returnedPantry(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(1, resultPantry.length);
    for (Pantry pantry : resultPantry) {
      assertEquals("corn FLAKEs", pantry.name);
      assertEquals("lmao", pantry.notes);
    }
  }

  @Test
  public void getPantryWithExistentId() throws IOException {
    String testID = samsId.toHexString();
    Context ctx = mockContext("api/pantry/{id}", Map.of("id", testID));

    pantryController.getPantry(ctx);
    Pantry resultPantry = returnedSinglePantryItem(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(samsId.toHexString(), resultPantry._id);
    assertEquals("corn FLAKEs", resultPantry.name);
  }

  @Test
  public void getPantryWithBadId() throws IOException {
    Context ctx = mockContext("api/pantry/{id}", Map.of("id", "bad"));

    assertThrows(BadRequestResponse.class, () -> {
      pantryController.getPantry(ctx);
    });
  }

  @Test
  public void getPantryWithNonexistentId() throws IOException {
    Context ctx = mockContext("api/pantry/{id}", Map.of("id", "58af3a600343927e48e87335"));

    assertThrows(NotFoundResponse.class, () -> {
      pantryController.getPantry(ctx);
    });
  }

  @Test
  public void addPantry() throws IOException {

    String testNewPantry = "{"
        + "\"name\": \"chips\","
        + "\"prodID\": \"8733g5\","
        + "\"notes\": \"hey\","
        + "\"date\": \"1/1/2011\""
        + "}";
    mockReq.setBodyContent(testNewPantry);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/pantry");

    pantryController.addNewPantry(ctx);
    String result = ctx.resultString();
    String id = javalinJackson.fromJsonString(result, ObjectNode.class).get("id").asText();

    // Our status should be 201, i.e., our new pantry was successfully
    // created. This is a named constant in the class HttpURLConnection.
    assertEquals(HttpURLConnection.HTTP_CREATED, mockRes.getStatus());

    // Successfully adding the pantry should return the newly generated MongoDB ID
    // for that pantry.
    assertNotEquals("", id);
    assertEquals(1, db.getCollection("pantry").countDocuments(eq("_id", new ObjectId(id))));

    // Verify that the pantry was added to the database with the correct ID
    Document addedPantry = db.getCollection("pantry").find(eq("_id", new ObjectId(id))).first();

    assertNotNull(addedPantry);
    assertEquals("chips", addedPantry.getString("name"));
    assertEquals("8733g5", addedPantry.getString("prodID"));
    assertEquals("hey", addedPantry.getString("notes"));
    assertEquals("1/1/2011", addedPantry.getString("date"));


  }

  @Test
  public void addInvalidProdIDPantry() throws IOException {
    String testNewPantry = "{"
    + "\"name\": \"chips\","
    + "\"prodID\": \"\","
    + "\"notes\": \"hey\","
    + "\"date\": \"1/1/2011\""
    + "}";
    mockReq.setBodyContent(testNewPantry);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/pantry");

    assertThrows(ValidationException.class, () -> {
      pantryController.addNewPantry(ctx);
    });
  }


  @Test
  public void addNullNamePantry() throws IOException {
    String testNewPantry = "{"
    + "\"prodID\": \"8733g5\","
    + "\"notes\": \"hey\","
    + "\"date\": \"1/1/2011\""
    + "}";
    mockReq.setBodyContent(testNewPantry);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/pantry");

    assertThrows(ValidationException.class, () -> {
      pantryController.addNewPantry(ctx);
    });
  }

  @Test
  public void addInvalidNamePantry() throws IOException {
    String testNewPantry = "{"
    + "\"name\": \"\","
    + "\"prodID\": \"8733g5\","
    + "\"notes\": \"hey\","
    + "\"date\": \"1/1/2011\""
    + "}";
    mockReq.setBodyContent(testNewPantry);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/pantry");

    assertThrows(ValidationException.class, () -> {
      pantryController.addNewPantry(ctx);
    });
  }



  @Test
  public void addNullProdIDPantry() throws IOException {
    String testNewPantry = "{"
    + "\"name\": \"chips\","
    + "\"notes\": \"hey\","
    + "\"date\": \"1/1/2011\""
    + "}";
    mockReq.setBodyContent(testNewPantry);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/pantry");

    assertThrows(ValidationException.class, () -> {
      pantryController.addNewPantry(ctx);
    });
  }
  
  @Test
  public void deletePantry() throws IOException {
    String testID = samsId.toHexString();

    // Pantry exists before deletion
    assertEquals(1, db.getCollection("pantry").countDocuments(eq("_id", new ObjectId(testID))));

    Context ctx = mockContext("api/pantry/{id}", Map.of("id", testID));

    pantryController.deletePantry(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());

    // Pantry is no longer in the database
    assertEquals(0, db.getCollection("pantry").countDocuments(eq("_id", new ObjectId(testID))));
  }

}
