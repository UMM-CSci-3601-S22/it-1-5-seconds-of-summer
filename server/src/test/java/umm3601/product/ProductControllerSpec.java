package umm3601.product;

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
 * Tests the logic of the ProductController
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
public class ProductControllerSpec {

  // Mock requests and responses that will be reset in `setupEach()`
  // and then (re)used in each of the tests.
  private MockHttpServletRequest mockReq = new MockHttpServletRequest();
  private MockHttpServletResponse mockRes = new MockHttpServletResponse();

  // An instance of the controller we're testing that is prepared in
  // `setupEach()`, and then exercised in the various tests below.
  private ProductController productController;

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
    MongoCollection<Document> productDocuments = db.getCollection("products");
    productDocuments.drop();
    List<Document> testProducts = new ArrayList<>();
    testProducts.add(
        new Document()
            .append("productName", "Corn syrup")
            .append("threshold", 25)
            .append("brand", "kellogs")
            .append("location", "front")
            .append("notes", "cool")
            .append("description", "George is very cool")
            .append("category", "dark")
            .append("lifespan", 15)
            .append("store", "willies"));
    testProducts.add(
        new Document()
        .append("productName", "Peas Snow")
        .append("threshold", 0)
        .append("brand", "UMM")
        .append("location", "Back")
        .append("notes", "admin")
        .append("description", "L")
        .append("category", "Bad")
        .append("lifespan", 3000)
        .append("store", "coop"));
    testProducts.add(
        new Document()
        .append("productName", "STUFF")
        .append("threshold", 5)
        .append("brand", "New Brand")
        .append("location", "Far Side")
        .append("notes", "Wierd Things")
        .append("description", "y")
        .append("category", "Very Good")
        .append("lifespan", 0)
        .append("store", "willies"));

    samsId = new ObjectId();
    Document sam = new Document()
        .append("_id", samsId)
        .append("productName", "Sam")
            .append("threshold", 25)
            .append("brand", "UMn")
            .append("location", "down")
            .append("notes", "nice")
            .append("description", "hi")
            .append("category", "neat")
            .append("lifespan", 69)
            .append("store", "coop");
    productDocuments.insertMany(testProducts);
    productDocuments.insertOne(sam);

    productController = new ProductController(db);
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
   * body contains an array of Products, and extracts and returns
   * that array.
   *
   * @param ctx the `Context` whose body is assumed to contain
   *  an array of `Product`s.
   * @return the array of `Product`s from the given `Context`.
   */
  private Product[] returnedProducts(Context ctx) {
    String result = ctx.resultString();
    Product[] products = javalinJackson.fromJsonString(result, Product[].class);
    return products;
  }

  /**
   * A little helper method that assumes that the given context
   * body contains a *single* Product, and extracts and returns
   * that Product.
   *
   * @param ctx the `Context` whose body is assumed to contain
   *  a *single* `Product`.
   * @return the `Product` extracted from the given `Context`.
   */
  private Product returnedSingleProduct(Context ctx) {
    String result = ctx.resultString();
    Product product = javalinJackson.fromJsonString(result, Product.class);
    return product;
  }

  @Test
  public void canGetAllProducts() throws IOException {
    // Create our fake Javalin context
    String path = "api/products";
    Context ctx = mockContext(path);

    productController.getProducts(ctx);
    Product[] returnedProducts = returnedProducts(ctx);

    // The response status should be 200, i.e., our request
    // was handled successfully (was OK). This is a named constant in
    // the class HttpCode.
    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(
      db.getCollection("products").countDocuments(),
      returnedProducts.length
    );
  }

  /**
   * Test that if the product sends a request with an illegal value in
   * the age field (i.e., something that can't be parsed to a number)
   * we get a reasonable error code back.
   */
  @Test
  public void respondsAppropriatelyToNonNumericThreshold() {

    mockReq.setQueryString("threshold=abc");
    Context ctx = mockContext("api/products");

    // This should now throw a `ValidationException` because
    // our request has an age that can't be parsed to a number.
    assertThrows(ValidationException.class, () -> {
      productController.getProducts(ctx);
    });
  }

  @Test
  public void canGetProductsByName() throws IOException {
    mockReq.setQueryString("productName=Corn syrup");
    Context ctx = mockContext("api/products");

    productController.getProducts(ctx);
    Product[] resultProducts = returnedProducts(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    assertEquals(1, resultProducts.length); // There should be two products returned
    for (Product product : resultProducts) {
      assertEquals("Corn syrup", product.productName);
    }
  }

  @Test
  public void getProductsByStore() throws IOException {
    mockReq.setQueryString("store=willies");
    Context ctx = mockContext("api/products");

    productController.getProducts(ctx);
    Product[] resultProducts = returnedProducts(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(2, resultProducts.length);
    for (Product product : resultProducts) {
      assertEquals("willies", product.store);
    }
  }

  @Test
  public void getProductsByNameAndThreshold() throws IOException {
    mockReq.setQueryString("productName=sam&threshold=25");
    Context ctx = mockContext("api/products");

    productController.getProducts(ctx);
    Product[] resultProducts = returnedProducts(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(1, resultProducts.length);
    for (Product product : resultProducts) {
      assertEquals("Sam", product.productName);
      assertEquals(25, product.threshold);
    }
  }

  @Test
  public void getProductWithExistentId() throws IOException {
    String testID = samsId.toHexString();
    Context ctx = mockContext("api/products/{id}", Map.of("id", testID));

    productController.getProduct(ctx);
    Product resultProduct = returnedSingleProduct(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());
    assertEquals(samsId.toHexString(), resultProduct._id);
    assertEquals("Sam", resultProduct.productName);
  }

  @Test
  public void getProductWithBadId() throws IOException {
    Context ctx = mockContext("api/products/{id}", Map.of("id", "bad"));

    assertThrows(BadRequestResponse.class, () -> {
      productController.getProduct(ctx);
    });
  }

  @Test
  public void getProductWithNonexistentId() throws IOException {
    Context ctx = mockContext("api/products/{id}", Map.of("id", "58af3a600343927e48e87335"));

    assertThrows(NotFoundResponse.class, () -> {
      productController.getProduct(ctx);
    });
  }

  @Test
  public void addProduct() throws IOException {

    String testNewProduct = "{"
        + "\"productName\": \"Test Product\","
        + "\"threshold\": 25,"
        + "\"brand\": \"testers\","
        + "\"description\": \"test@example.com\","
        + "\"store\": \"coop\","
        + "\"category\": \"llll\","
        + "\"location\": \"top\","
        + "\"lifespan\": 30,"
        + "\"notes\": \"sad\""
        + "}";
    mockReq.setBodyContent(testNewProduct);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/products");

    productController.addNewProduct(ctx);
    String result = ctx.resultString();
    String id = javalinJackson.fromJsonString(result, ObjectNode.class).get("id").asText();

    // Our status should be 201, i.e., our new product was successfully
    // created. This is a named constant in the class HttpURLConnection.
    assertEquals(HttpURLConnection.HTTP_CREATED, mockRes.getStatus());

    // Successfully adding the product should return the newly generated MongoDB ID
    // for that product.
    assertNotEquals("", id);
    assertEquals(1, db.getCollection("products").countDocuments(eq("_id", new ObjectId(id))));

    // Verify that the product was added to the database with the correct ID
    Document addedProduct = db.getCollection("products").find(eq("_id", new ObjectId(id))).first();

    assertNotNull(addedProduct);
    assertEquals("Test Product", addedProduct.getString("productName"));
    assertEquals(25, addedProduct.getInteger("threshold"));
    assertEquals("testers", addedProduct.getString("brand"));
    assertEquals("test@example.com", addedProduct.getString("description"));
    assertEquals("coop", addedProduct.getString("store"));
    assertEquals("llll", addedProduct.getString("category"));
    assertEquals("top", addedProduct.getString("location"));
    assertEquals("sad", addedProduct.getString("notes"));
    assertEquals(30, addedProduct.getInteger("lifespan"));


  }

  @Test
  public void addInvalidNameProduct() throws IOException {
    String testNewProduct = "{"
    + "\"productName\": \"\","
    + "\"threshold\": 25,"
    + "\"brand\": \"testers\","
    + "\"description\": \"test@example.com\","
    + "\"store\": \"coop\","
    + "\"category\": \"llll\","
    + "\"location\": \"top\","
    + "\"lifespan\": 30,"
    + "\"notes\": \"sad\""
    + "}";
    mockReq.setBodyContent(testNewProduct);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/products");

    assertThrows(ValidationException.class, () -> {
      productController.addNewProduct(ctx);
    });
  }

  @Test
  public void addInvalidThresholdProduct() throws IOException {
    String testNewProduct = "{"
    + "\"productName\": \"Test Product\","
    + "\"threshold\": -1,"
    + "\"brand\": \"testers\","
    + "\"description\": \"test@example.com\","
    + "\"store\": \"coop\","
    + "\"category\": \"llll\","
    + "\"location\": \"top\","
    + "\"lifespan\": 30,"
    + "\"notes\": \"sad\""
    + "}";
    mockReq.setBodyContent(testNewProduct);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/products");

    assertThrows(ValidationException.class, () -> {
      productController.addNewProduct(ctx);
    });
  }

  @Test
  public void addNullNameProduct() throws IOException {
    String testNewProduct = "{"
    + "\"threshold\": 25,"
    + "\"brand\": \"testers\","
    + "\"description\": \"test@example.com\","
    + "\"store\": \"coop\","
    + "\"category\": \"llll\","
    + "\"location\": \"top\","
    + "\"lifespan\": 30,"
    + "\"notes\": \"sad\""
    + "}";
    mockReq.setBodyContent(testNewProduct);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/products");

    assertThrows(ValidationException.class, () -> {
      productController.addNewProduct(ctx);
    });
  }

  @Test
  public void addInvalidStoreProduct() throws IOException {
    String testNewProduct = "{"
    + "\"productName\": \"Test Product\","
    + "\"threshold\": 25,"
    + "\"brand\": \"testers\","
    + "\"description\": \"test@example.com\","
    + "\"store\": \"butt\","
    + "\"category\": \"llll\","
    + "\"location\": \"top\","
    + "\"lifespan\": 30,"
    + "\"notes\": \"sad\""
    + "}";
    mockReq.setBodyContent(testNewProduct);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/products");

    assertThrows(ValidationException.class, () -> {
      productController.addNewProduct(ctx);
    });
  }

  @Test
  public void addInvalidLifespanProduct() throws IOException {
    String testNewProduct = "{"
    + "\"productName\": \"Test Product\","
    + "\"threshold\": 25,"
    + "\"brand\": \"testers\","
    + "\"description\": \"test@example.com\","
    + "\"store\": \"coop\","
    + "\"category\": \"llll\","
    + "\"location\": \"top\","
    + "\"lifespan\": -30,"
    + "\"notes\": \"sad\""
    + "}";
    mockReq.setBodyContent(testNewProduct);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/products");

    assertThrows(ValidationException.class, () -> {
      productController.addNewProduct(ctx);
    });
  }

  @Test
  public void deleteProduct() throws IOException {
    String testID = samsId.toHexString();

    // Product exists before deletion
    assertEquals(1, db.getCollection("products").countDocuments(eq("_id", new ObjectId(testID))));

    Context ctx = mockContext("api/products/{id}", Map.of("id", testID));

    productController.deleteProduct(ctx);

    assertEquals(HttpURLConnection.HTTP_OK, mockRes.getStatus());

    // Product is no longer in the database
    assertEquals(0, db.getCollection("products").countDocuments(eq("_id", new ObjectId(testID))));
  }

}
