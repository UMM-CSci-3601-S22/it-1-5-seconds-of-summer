package umm3601.shoppinglist;

import static com.mongodb.client.model.Filters.eq;
import static io.javalin.plugin.json.JsonMapperKt.JSON_MAPPER_KEY;
import static java.util.Map.entry;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

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
import umm3601.shoppingList.ShoppingList;
import umm3601.shoppingList.ShoppingListController;

/**
 * Tests the logic of the ShoppingListController
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
public class ShoppingListControllerSpec {

    // Mock requests and responses that will be reset in `setupEach()`
    // and then (re)used in each of the tests.
    private MockHttpServletRequest mockReq = new MockHttpServletRequest();
    private MockHttpServletResponse mockRes = new MockHttpServletResponse();

    // An instance of the controller we're testing that is prepared in
    // `setupEach()`, and then exercised in the various tests below.
    private ShoppingListController shoppingListController;

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
                        .build());
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
        MongoCollection<Document> shoppingListDocuments = db.getCollection("shoppingList");
        shoppingListDocuments.drop();
        List<Document> testShoppingList = new ArrayList<>();
        testShoppingList.add(
                new Document()
                        .append("store", "willies")
                        .append("productName", "apple")
                        .append("quantity", 100));
        testShoppingList.add(
                new Document()
                        .append("store", "coop")
                        .append("productName", "Banana")
                        .append("quantity", 10069));
        testShoppingList.add(
                new Document()
                        .append("store", "coop")
                        .append("productName", "PORK LOIN")
                        .append("quantity", 10));
        samsId = new ObjectId();
        Document sam = new Document()
                .append("_id", samsId)
                .append("store", "willies")
                .append("productName", "corn FLAKEs")
                .append("quantity", 5);
        shoppingListDocuments.insertMany(testShoppingList);
        shoppingListDocuments.insertOne(sam);

        shoppingListController = new ShoppingListController(db);
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
     * - One is a `JsonMapper` that is used to translate between POJOs and JSON
     * objects. This is needed by almost every test.
     * - The other is `maxRequestSize`, which is needed for all the ADD requests,
     * since `ContextUtil` checks to make sure that the request isn't "too big".
     * Those tests fails if you don't provide a value for `maxRequestSize` for
     * it to use in those comparisons.
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
                                new JavalinConfig().maxRequestSize)));
    }

    /**
     * A little helper method that assumes that the given context
     * body contains an array of ShoppingList, and extracts and returns
     * that array.
     *
     * @param ctx the `Context` whose body is assumed to contain
     *            an array of `ShoppingList`s.
     * @return the array of `ShoppingList`s from the given `Context`.
     */
    private ShoppingList[] returnedShoppingList(Context ctx) {
        String result = ctx.resultString();
        ShoppingList[] shoppingList = javalinJackson.fromJsonString(result, ShoppingList[].class);
        return shoppingList;
    }

    /**
     * A little helper method that assumes that the given context
     * body contains a *single* ShoppingList, and extracts and returns
     * that ShoppingList.
     *
     * @param ctx the `Context` whose body is assumed to contain
     *            a *single* `ShoppingList`.
     * @return the `ShoppingList` extracted from the given `Context`.
     */
    private ShoppingList returnedSingleShoppingListItem(Context ctx) {
        String result = ctx.resultString();
        ShoppingList shoppingList = javalinJackson.fromJsonString(result, ShoppingList.class);
        return shoppingList;
    }

    @Test
    public void canGetAllShoppingListItems() throws IOException {
        // Create our fake Javalin context
        String path = "api/shoppingList";
        Context ctx = mockContext(path);

        shoppingListController.getShoppingLists(ctx);
        ShoppingList[] returnedShoppingList = returnedShoppingList(ctx);

        // The response status should be 200, i.e., our request
        // was handled successfully (was OK). This is a named constant in
        // the class HttpCode.
        assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
        assertEquals(
                db.getCollection("shoppingList").countDocuments(),
                returnedShoppingList.length);
    }

    @Test
    public void canGetShoppingListItemsByName() throws IOException {
        mockReq.setQueryString("productName=pork loin");
        Context ctx = mockContext("api/shoppingList");

        shoppingListController.getShoppingLists(ctx);
        ShoppingList[] resultShoppingList = returnedShoppingList(ctx);

        assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
        assertEquals(1, resultShoppingList.length); // There should be two shoppingList returned
        for (ShoppingList shoppingList : resultShoppingList) {
            assertEquals("PORK LOIN", shoppingList.productName);
        }
    }

    @Test
    public void getShoppingListByNameAndNotes() throws IOException {
        mockReq.setQueryString("name=corn FLAKEs&quantity=5");
        Context ctx = mockContext("api/shoppingList");

        shoppingListController.getShoppingLists(ctx);
        ShoppingList[] resultShoppingList = returnedShoppingList(ctx);

        assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
        assertEquals(1, resultShoppingList.length);
        for (ShoppingList shoppingList : resultShoppingList) {
            assertEquals("corn FLAKEs", shoppingList.productName);
            assertEquals(5, shoppingList.quantity);
        }
    }

    @Test
    public void getShoppingListWithExistentId() throws IOException {
        String testID = samsId.toHexString();
        Context ctx = mockContext("api/shoppingList/{id}", Map.of("id", testID));

        shoppingListController.getShoppingList(ctx);
        ShoppingList resultShoppingList = returnedSingleShoppingListItem(ctx);

        assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
        assertEquals(samsId.toHexString(), resultShoppingList._id);
        assertEquals("corn FLAKEs", resultShoppingList.productName);
    }

    @Test
    public void getShoppingListWithBadId() throws IOException {
        Context ctx = mockContext("api/shoppingList/{id}", Map.of("id", "bad"));

        assertThrows(BadRequestResponse.class, () -> {
            shoppingListController.getShoppingList(ctx);
        });
    }

    @Test
    public void getShoppingListWithNonexistentId() throws IOException {
        Context ctx = mockContext("api/shoppingList/{id}", Map.of("id", "58af3a600343927e48e87335"));

        assertThrows(NotFoundResponse.class, () -> {
            shoppingListController.getShoppingList(ctx);
        });
    }

    @Test
    public void addShoppingList() throws IOException {

        String testNewShoppingList = "{"
                + "\"productName\": \"chips\","
                + "\"store\": \"coop\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewShoppingList);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/shoppingList");

        shoppingListController.addNewShoppingList(ctx);
        String result = ctx.resultString();
        String id = javalinJackson.fromJsonString(result, ObjectNode.class).get("id").asText();

        // Our status should be 201, i.e., our new shoppingList was successfully
        // created. This is a named constant in the class HttpURLConnection.
        assertEquals(HttpURLConnection.HTTP_CREATED, mockRes.getStatus());

        // Successfully adding the shoppingList should return the newly generated
        // MongoDB ID
        // for that shoppingList.
        assertNotEquals("", id);
        assertEquals(1, db.getCollection("shoppingList").countDocuments(eq("_id", new ObjectId(id))));

        // Verify that the shoppingList was added to the database with the correct ID
        Document addedShoppingList = db.getCollection("shoppingList").find(eq("_id", new ObjectId(id))).first();

        assertNotNull(addedShoppingList);
        assertEquals("chips", addedShoppingList.getString("productName"));
        assertEquals("coop", addedShoppingList.getString("store"));
        assertEquals(69, addedShoppingList.getInteger("quantity"));

    }

    @Test
    public void addInvalidStoreShoppingList() throws IOException {
        String testNewShoppingList = "{"
                + "\"productName\": \"chips\","
                + "\"store\": \"\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewShoppingList);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/shoppingList");

        assertThrows(ValidationException.class, () -> {
            shoppingListController.addNewShoppingList(ctx);
        });
    }

    @Test
    public void addNullProductNameShoppingList() throws IOException {
        String testNewShoppingList = "{"
                + "\"store\": \"coop\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewShoppingList);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/shoppingList");

        assertThrows(ValidationException.class, () -> {
            shoppingListController.addNewShoppingList(ctx);
        });
    }

    @Test
    public void addInvalidProductNameShoppingList() throws IOException {
        String testNewShoppingList = "{"
                + "\"productName\": \"\","
                + "\"store\": \"coop\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewShoppingList);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/shoppingList");

        assertThrows(ValidationException.class, () -> {
            shoppingListController.addNewShoppingList(ctx);
        });
    }

    @Test
    public void addNullStoreShoppingList() throws IOException {
        String testNewShoppingList = "{"
                + "\"productName\": \"chips\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewShoppingList);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/shoppingList");

        assertThrows(ValidationException.class, () -> {
            shoppingListController.addNewShoppingList(ctx);
        });
    }

    @Test
    public void addNonRegisteredStoreShoppingList() throws IOException {
        String testNewShoppingList = "{"
                + "\"productName\": \"chips\","
                + "\"store\": \"target\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewShoppingList);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/shoppingList");

        assertThrows(ValidationException.class, () -> {
            shoppingListController.addNewShoppingList(ctx);
        });
    }

    @Test
    public void addInvalidQuantityProduct() throws IOException {
        String testNewProduct = "{"
                + "\"productName\": \"chips\","
                + "\"store\": \"coop\","
                + "\"quantity\": -96"
                + "}";
        mockReq.setBodyContent(testNewProduct);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/products");

        assertThrows(ValidationException.class, () -> {
            shoppingListController.addNewShoppingList(ctx);
        });
    }

    @Test
    public void deleteShoppingList() throws IOException {
        String testID = samsId.toHexString();

        // ShoppingList exists before deletion
        assertEquals(1, db.getCollection("shoppingList").countDocuments(eq("_id", new ObjectId(testID))));

        Context ctx = mockContext("api/shoppingList/{id}", Map.of("id", testID));

        shoppingListController.deleteShoppingList(ctx);

        assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());

        // ShoppingList is no longer in the database
        assertEquals(0, db.getCollection("shoppingList").countDocuments(eq("_id", new ObjectId(testID))));
    }

}
