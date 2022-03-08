package umm3601.template;

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

/**
 * Tests the logic of the TemplateController
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
public class TemplateControllerSpec {

    // Mock requests and responses that will be reset in `setupEach()`
    // and then (re)used in each of the tests.
    private MockHttpServletRequest mockReq = new MockHttpServletRequest();
    private MockHttpServletResponse mockRes = new MockHttpServletResponse();

    // An instance of the controller we're testing that is prepared in
    // `setupEach()`, and then exercised in the various tests below.
    private TemplateController templateController;

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
        MongoCollection<Document> templateDocuments = db.getCollection("template");
        templateDocuments.drop();
        List<Document> testTemplate = new ArrayList<>();
        testTemplate.add(
                new Document()
                        .append("prodID", "588935f5")
                        .append("name", "apple")
                        .append("quantity", 100));
        testTemplate.add(
                new Document()
                        .append("prodID", "6f992bf")
                        .append("name", "Banana")
                        .append("quantity", 10069));
        testTemplate.add(
                new Document()
                        .append("prodID", "8f37c")
                        .append("name", "PORK LOIN")
                        .append("quantity", 10));
        samsId = new ObjectId();
        Document sam = new Document()
                .append("_id", samsId)
                .append("prodID", "f992bf8f37c01")
                .append("name", "corn FLAKEs")
                .append("quantity", 5);
        templateDocuments.insertMany(testTemplate);
        templateDocuments.insertOne(sam);

        templateController = new TemplateController(db);
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
     * body contains an array of Template, and extracts and returns
     * that array.
     *
     * @param ctx the `Context` whose body is assumed to contain
     *            an array of `Template`s.
     * @return the array of `Template`s from the given `Context`.
     */
    private Template[] returnedTemplate(Context ctx) {
        String result = ctx.resultString();
        Template[] template = javalinJackson.fromJsonString(result, Template[].class);
        return template;
    }

    /**
     * A little helper method that assumes that the given context
     * body contains a *single* Template, and extracts and returns
     * that Template.
     *
     * @param ctx the `Context` whose body is assumed to contain
     *            a *single* `Template`.
     * @return the `Template` extracted from the given `Context`.
     */
    private Template returnedSingleTemplateItem(Context ctx) {
        String result = ctx.resultString();
        Template template = javalinJackson.fromJsonString(result, Template.class);
        return template;
    }

    @Test
    public void canGetAllTemplateItems() throws IOException {
        // Create our fake Javalin context
        String path = "api/template";
        Context ctx = mockContext(path);

        templateController.getTemplates(ctx);
        Template[] returnedTemplate = returnedTemplate(ctx);

        // The response status should be 200, i.e., our request
        // was handled successfully (was OK). This is a named constant in
        // the class HttpCode.
        assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
        assertEquals(
                db.getCollection("template").countDocuments(),
                returnedTemplate.length);
    }

    @Test
    public void canGetTemplateItemsByName() throws IOException {
        mockReq.setQueryString("name=pork loin");
        Context ctx = mockContext("api/template");

        templateController.getTemplates(ctx);
        Template[] resultTemplate = returnedTemplate(ctx);

        assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
        assertEquals(1, resultTemplate.length); // There should be two template returned
        for (Template template : resultTemplate) {
            assertEquals("PORK LOIN", template.name);
        }
    }

    @Test
    public void getTemplateByNameAndNotes() throws IOException {
        mockReq.setQueryString("name=corn FLAKEs&quantity=5");
        Context ctx = mockContext("api/template");

        templateController.getTemplates(ctx);
        Template[] resultTemplate = returnedTemplate(ctx);

        assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
        assertEquals(1, resultTemplate.length);
        for (Template template : resultTemplate) {
            assertEquals("corn FLAKEs", template.name);
            assertEquals(5, template.quantity);
        }
    }

    @Test
    public void getTemplateWithExistentId() throws IOException {
        String testID = samsId.toHexString();
        Context ctx = mockContext("api/template/{id}", Map.of("id", testID));

        templateController.getTemplate(ctx);
        Template resultTemplate = returnedSingleTemplateItem(ctx);

        assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
        assertEquals(samsId.toHexString(), resultTemplate._id);
        assertEquals("corn FLAKEs", resultTemplate.name);
    }

    @Test
    public void getTemplateWithBadId() throws IOException {
        Context ctx = mockContext("api/template/{id}", Map.of("id", "bad"));

        assertThrows(BadRequestResponse.class, () -> {
            templateController.getTemplate(ctx);
        });
    }

    @Test
    public void getTemplateWithNonexistentId() throws IOException {
        Context ctx = mockContext("api/template/{id}", Map.of("id", "58af3a600343927e48e87335"));

        assertThrows(NotFoundResponse.class, () -> {
            templateController.getTemplate(ctx);
        });
    }

    @Test
    public void addTemplate() throws IOException {

        String testNewTemplate = "{"
                + "\"name\": \"chips\","
                + "\"prodID\": \"8733g5\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewTemplate);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/template");

        templateController.addNewTemplate(ctx);
        String result = ctx.resultString();
        String id = javalinJackson.fromJsonString(result, ObjectNode.class).get("id").asText();

        // Our status should be 201, i.e., our new template was successfully
        // created. This is a named constant in the class HttpURLConnection.
        assertEquals(HttpURLConnection.HTTP_CREATED, mockRes.getStatus());

        // Successfully adding the template should return the newly generated MongoDB ID
        // for that template.
        assertNotEquals("", id);
        assertEquals(1, db.getCollection("template").countDocuments(eq("_id", new ObjectId(id))));

        // Verify that the template was added to the database with the correct ID
        Document addedTemplate = db.getCollection("template").find(eq("_id", new ObjectId(id))).first();

        assertNotNull(addedTemplate);
        assertEquals("chips", addedTemplate.getString("name"));
        assertEquals("8733g5", addedTemplate.getString("prodID"));
        assertEquals(69, addedTemplate.getInteger("quantity"));

    }

    @Test
    public void addInvalidProdIDTemplate() throws IOException {
        String testNewTemplate = "{"
                + "\"name\": \"chips\","
                + "\"prodID\": \"\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewTemplate);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/template");

        assertThrows(ValidationException.class, () -> {
            templateController.addNewTemplate(ctx);
        });
    }

    @Test
    public void addNullNameTemplate() throws IOException {
        String testNewTemplate = "{"
                + "\"prodID\": \"8733g5\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewTemplate);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/template");

        assertThrows(ValidationException.class, () -> {
            templateController.addNewTemplate(ctx);
        });
    }

    @Test
    public void addInvalidNameTemplate() throws IOException {
        String testNewTemplate = "{"
                + "\"name\": \"\","
                + "\"prodID\": \"8733g5\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewTemplate);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/template");

        assertThrows(ValidationException.class, () -> {
            templateController.addNewTemplate(ctx);
        });
    }

    @Test
    public void addNullProdIDTemplate() throws IOException {
        String testNewTemplate = "{"
                + "\"name\": \"chips\","
                + "\"quantity\": 69"
                + "}";
        mockReq.setBodyContent(testNewTemplate);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/template");

        assertThrows(ValidationException.class, () -> {
            templateController.addNewTemplate(ctx);
        });
    }

    @Test
    public void addInvalidThresholdProduct() throws IOException {
        String testNewProduct = "{"
                + "\"name\": \"chips\","
                + "\"prodID\": \"8733g5\","
                + "\"quantity\": -96"
                + "}";
        mockReq.setBodyContent(testNewProduct);
        mockReq.setMethod("POST");

        Context ctx = mockContext("api/products");

        assertThrows(ValidationException.class, () -> {
            templateController.addNewTemplate(ctx);
        });
    }

    @Test
    public void deleteTemplate() throws IOException {
        String testID = samsId.toHexString();

        // Template exists before deletion
        assertEquals(1, db.getCollection("template").countDocuments(eq("_id", new ObjectId(testID))));

        Context ctx = mockContext("api/template/{id}", Map.of("id", testID));

        templateController.deleteTemplate(ctx);

        assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());

        // Template is no longer in the database
        assertEquals(0, db.getCollection("template").countDocuments(eq("_id", new ObjectId(testID))));
    }

}
