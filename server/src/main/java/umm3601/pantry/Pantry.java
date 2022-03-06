package umm3601.pantry;

import org.mongojack.Id;
import org.mongojack.ObjectId;

// There are two examples of suppressing CheckStyle
// warnings in this class. If you create new classes
// that mirror data in MongoDB and that will be managed
// by MongoJack, then you'll probably need to suppress
// the same warnings in your classes as well so that
// CheckStyle doesn't shout at you and cause the build
// to fail.

// Normally you'd want all fields to be private, but
// we need the fields in this class to be public since
// they will be written to by Mongo via the MongoJack
// library. We need to suppress the Visibility Modifier
// (https://checkstyle.sourceforge.io/config_design.html#VisibilityModifier)
// check in CheckStyle so that we don't get a failed
// build when Gradle runs CheckStyle.
@SuppressWarnings({"VisibilityModifier"})
public class Pantry {

  @ObjectId @Id
  // By default Java field names shouldn't start with underscores.
  // Here, though, we *have* to use the name `_id` to match the
  // name of the field as used by MongoDB.
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String prodID;
  public String name;
  public String date;
  public String notes;
}
