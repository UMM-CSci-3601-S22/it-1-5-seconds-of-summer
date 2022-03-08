package umm3601.shoppingList;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpCode;
import io.javalin.http.NotFoundResponse;

/**
 * Controller that manages requests for info about shoppingLists.
 */
public class ShoppingListController {

  private static final String QUANTITY_KEY = "quantity";
  private static final String PRODUCTNAME_KEY = "productName";
  private static final String STORE_KEY = "store";

  private final JacksonMongoCollection<ShoppingList> shoppingListCollection;

  /**
   * Construct a controller for shoppingLists.
   *
   * @param database the database containing shoppingList data
   */
  public ShoppingListController(MongoDatabase database) {
    shoppingListCollection = JacksonMongoCollection.builder().build(
        database,
        "shoppingList",
        ShoppingList.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Get the single shoppingList specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getShoppingList(Context ctx) {
    String id = ctx.pathParam("id");
    ShoppingList shoppingList;
    System.out.println(id);
    System.out.println(shoppingListCollection.find().first());
    System.out.println("Got the first");

    try {
      shoppingList = shoppingListCollection.find(eq("_id", new ObjectId(id))).first();
      System.out.println(shoppingList);
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested shoppingList id wasn't a legal Mongo Object ID.");
    }
    if (shoppingList == null) {
      throw new NotFoundResponse("The requested shoppingList was not found");
    } else {
      ctx.json(shoppingList);
      System.out.println(ctx);
    }
  }

  /**
   * Get a JSON response with a list of all the shoppingLists.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getShoppingLists(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the shoppingLists with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<ShoppingList> matchingShoppingLists = shoppingListCollection
        .find(combinedFilter)
        .sort(sortingOrder)
        .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of shoppingLists returned by
    // the database.
    ctx.json(matchingShoppingLists);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with a blank document
    if (ctx.queryParamMap().containsKey(PRODUCTNAME_KEY)) {
      filters.add(regex(PRODUCTNAME_KEY, Pattern.quote(ctx.queryParam(PRODUCTNAME_KEY)), "?i"));
    }
    if (ctx.queryParamMap().containsKey(STORE_KEY)) {
      filters.add(eq(STORE_KEY, ctx.queryParam(STORE_KEY)));
    }
    if (ctx.queryParamMap().containsKey(QUANTITY_KEY)) {
        int targetQuantity = ctx.queryParamAsClass(QUANTITY_KEY, Integer.class).get();
        filters.add(eq(QUANTITY_KEY, targetQuantity));
    }

    // Combine the list of filters into a single filtering document.
    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  private Bson constructSortingOrder(Context ctx) {
    // Sort the results. Use the `sortby` query param (default "name")
    // as the field to sort by, and the query param `sortorder` (default
    // "asc") to specify the sort order.
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "name");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ? Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }

  /**
   * Get a JSON response with a list of all the shoppingLists.
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewShoppingList(Context ctx) {
    /*
     * The follow chain of statements uses the Javalin validator system
     * to verify that instance of `ShoppingList` provided in this context is
     * a "legal" shoppingList. It checks the following things (in order):
     * - The shoppingList has a value for the name (`usr.name != null`)
     * - The shoppingList name is not blank (`usr.name.length > 0`)
     * - The provided email is valid (matches EMAIL_REGEX)
     * - The provided age is > 0
     * - The provided role is valid (one of "admin", "editor", or "viewer")
     * - A non-blank company is provided
     */
    ShoppingList newShoppingList = ctx.bodyValidator(ShoppingList.class)
        .check(usr -> usr.productName != null && usr.productName.length() > 0,
            "ShoppingList must have a non-empty shoppingList name")
        .check(usr -> usr.store.matches("^(willies|coop)$"),
         "Item must have a legal store")
        .check(usr -> usr.quantity > 0,
            "ShoppingList Quantity must be greater than zero")
        .get();

    shoppingListCollection.insertOne(newShoppingList);

    // 201 is the HTTP code for when we successfully
    // create a new resource (a shoppingList in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpCode.CREATED);
    ctx.json(Map.of("id", newShoppingList._id));
  }

  /**
   * Delete the shoppingList specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteShoppingList(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = shoppingListCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      throw new NotFoundResponse(
          "Was unable to delete ID "
              + id
              + "; perhaps illegal ID or an ID for an item not in the system?");
    }
  }
}
