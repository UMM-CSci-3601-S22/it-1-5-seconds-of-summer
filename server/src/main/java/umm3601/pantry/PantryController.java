package umm3601.pantry;

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
 * Controller that manages requests for info about pantrys.
 */
public class PantryController {

  private static final String DATE_KEY = "date";
  private static final String NOTES_KEY = "notes";
  private static final String NAME_KEY = "name";
  private static final String PROD_KEY = "prodID";

  private final JacksonMongoCollection<Pantry> pantryCollection;

  /**
   * Construct a controller for pantrys.
   *
   * @param database the database containing pantry data
   */
  public PantryController(MongoDatabase database) {
    pantryCollection = JacksonMongoCollection.builder().build(
        database,
        "pantry",
        Pantry.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Get the single pantry specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getPantry(Context ctx) {
    String id = ctx.pathParam("id");
    Pantry pantry;

    try {
      pantry = pantryCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested pantry id wasn't a legal Mongo Object ID.");
    }
    if (pantry == null) {
      throw new NotFoundResponse("The requested pantry was not found");
    } else {
      ctx.json(pantry);
    }
  }

  /**
   * Get a JSON response with a list of all the pantrys.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getPantrys(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the pantrys with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<Pantry> matchingPantrys = pantryCollection
        .find(combinedFilter)
        .sort(sortingOrder)
        .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of pantrys returned by
    // the database.
    ctx.json(matchingPantrys);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with a blank document
    if (ctx.queryParamMap().containsKey(NAME_KEY)) {
      filters.add(regex(NAME_KEY, Pattern.quote(ctx.queryParam(NAME_KEY)), "?i"));
    }
    if (ctx.queryParamMap().containsKey(PROD_KEY)) {
      filters.add(eq(PROD_KEY, ctx.queryParam(PROD_KEY)));
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
   * Get a JSON response with a list of all the pantrys.
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewPantry(Context ctx) {
    /*
     * The follow chain of statements uses the Javalin validator system
     * to verify that instance of `Pantry` provided in this context is
     * a "legal" pantry. It checks the following things (in order):
     * - The pantry has a value for the name (`usr.name != null`)
     * - The pantry name is not blank (`usr.name.length > 0`)
     * - The provided email is valid (matches EMAIL_REGEX)
     * - The provided age is > 0
     * - The provided role is valid (one of "admin", "editor", or "viewer")
     * - A non-blank company is provided
     */
    Pantry newPantry = ctx.bodyValidator(Pantry.class)
        .check(usr -> usr.name != null && usr.name.length() > 0,
            "Pantry must have a non-empty pantry name")
        .check(usr -> usr.prodID != null && usr.prodID.length() > 0,
            "Pantry must have a non-empty pantry name")
        .get();

    pantryCollection.insertOne(newPantry);

    // 201 is the HTTP code for when we successfully
    // create a new resource (a pantry in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpCode.CREATED);
    ctx.json(Map.of("id", newPantry._id));
  }

  /**
   * Delete the pantry specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deletePantry(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = pantryCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      throw new NotFoundResponse(
          "Was unable to delete ID "
              + id
              + "; perhaps illegal ID or an ID for an item not in the system?");
    }
  }
}
