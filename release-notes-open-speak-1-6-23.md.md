**Plugin Info:**

`Plugin Name`: Open Speak

`Description`: Open Speak Component for OpenHouse. (Digital)

`Version`: 1.0.4

`Requires at least`: 5.9

`Requires PHP`: 7.2

`Author`: OpenHouse Lake Mary

---

**Api Gateway Api’s used:**

-   wp-plugin-handler-api-2.0

**IAM User:**

-   cbeam@openinsurance.com

---

## Updates:

**Summary**:

-   Fixed bug with Phone Input component, where users were unable to enter the full 10 digit phone number if they
    did not click the very left part of the field.

**Key Changes**:

-   The cursor will always be positioned at the last number entered by the user, regardless of where they click on the input field.

-   Disabled text mask guide visibility as this was confusing the state of the cursor.

**Jira Task Reference:**

-   OI-133: Issue with phone number field in callback plugins
