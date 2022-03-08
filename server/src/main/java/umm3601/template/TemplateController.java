package umm3601.template;

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
 * Controller that manages requests for info about templates.
 */
public class TemplateController {

  private static final String QUANTITY_KEY = "quantity";
  private static final String NAME_KEY = "name";
  private static final String PROD_KEY = "prodID";

  private final JacksonMongoCollection<Template> templateCollection;

  /**
   * Construct a controller for templates.
   *
   * @param database the database containing template data
   */
  public TemplateController(MongoDatabase database) {
    templateCollection = JacksonMongoCollection.builder().build(
        database,
        "template",
        Template.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Get the single template specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTemplate(Context ctx) {
    String id = ctx.pathParam("id");
    Template template;
    System.out.println(id);
    System.out.println(templateCollection.find().first());
    System.out.println("Got the first");

    try {
      template = templateCollection.find(eq("_id", new ObjectId(id))).first();
      System.out.println(template);
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested template id wasn't a legal Mongo Object ID.");
    }
    if (template == null) {
      throw new NotFoundResponse("The requested template was not found");
    } else {
      ctx.json(template);
      System.out.println(ctx);
    }
  }

  /**
   * Get a JSON response with a list of all the templates.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTemplates(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the templates with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<Template> matchingTemplates = templateCollection
        .find(combinedFilter)
        .sort(sortingOrder)
        .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of templates returned by
    // the database.
    ctx.json(matchingTemplates);
  }

  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with a blank document
    if (ctx.queryParamMap().containsKey(NAME_KEY)) {
      filters.add(regex(NAME_KEY, Pattern.quote(ctx.queryParam(NAME_KEY)), "?i"));
    }
    if (ctx.queryParamMap().containsKey(PROD_KEY)) {
      filters.add(eq(PROD_KEY, ctx.queryParam(PROD_KEY)));
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
   * Get a JSON response with a list of all the templates.
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewTemplate(Context ctx) {
    /*
     * The follow chain of statements uses the Javalin validator system
     * to verify that instance of `Template` provided in this context is
     * a "legal" template. It checks the following things (in order):
     * - The template has a value for the name (`usr.name != null`)
     * - The template name is not blank (`usr.name.length > 0`)
     * - The provided email is valid (matches EMAIL_REGEX)
     * - The provided age is > 0
     * - The provided role is valid (one of "admin", "editor", or "viewer")
     * - A non-blank company is provided
     */
    Template newTemplate = ctx.bodyValidator(Template.class)
        .check(usr -> usr.name != null && usr.name.length() > 0,
            "Template must have a non-empty template name")
        .check(usr -> usr.prodID != null && usr.prodID.length() > 0,
            "Template must have a non-empty template name")
         .check(usr -> usr.quantity > 0,
            "Template Quantity must be greater than zero")
        .get();

    templateCollection.insertOne(newTemplate);

    // 201 is the HTTP code for when we successfully
    // create a new resource (a template in this case).
    // See, e.g., https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
    // for a description of the various response codes.
    ctx.status(HttpCode.CREATED);
    ctx.json(Map.of("id", newTemplate._id));
  }

  /**
   * Delete the template specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteTemplate(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = templateCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      throw new NotFoundResponse(
          "Was unable to delete ID "
              + id
              + "; perhaps illegal ID or an ID for an item not in the system?");
    }
  }
}
