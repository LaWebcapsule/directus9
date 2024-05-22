# Relational

> Interfaces are how users interact with fields on the Item Detail page. These are the standard Relational interfaces.
> We recommend that you review [Relationships](/configuration/data-model/relationships) before working with Relational
> interfaces.

## File

Interface that allows uses to upload a single file of any mime-type, choose an existing file from the
[File Library](/app/file-library), or import a file from a URL.

- **Folder**: Folder for the uploaded files. Does not affect the location of existing files.

## Image

Interface that allows uses to upload a single image file, choose an existing image from the
[File Library](/app/file-library), or import an image from a URL.

- **Folder**: Folder for the uploaded files. Does not affect the location of existing files.
- **Crop to Fit**: Crop the image as needed when displaying the image.

## Files

Interface that allows uses to upload multiple files, choose an existing image from the
[File Library](/app/file-library), or import an image from a URL.

This field will create a [Many-To-Many (M2M)](/configuration/data-model/relationships#many-to-many-m2m) junction
collection when added to the [Data Model](/configuration/data-model) for your
[Collection](/configuration/data-model/collections).

- **Folder**: Folder for the uploaded files. Does not affect the location of existing files.
- [**Display Template**](/app/display-templates): Fields or custom text that represent the specific item through various
  places in the App Studio.
- **Creating Items**: Allow users to upload new files.
- **Selecting Items**: Allow users to select existing files.
- **Per Page**: The number of Items to show per page.

## Builder (M2A)

Interface that allows users to create relationships between the current item and multiple items from multiple, distinct
collections. See [Many-to-Any (M2A) Relationships](/configuration/data-model/relationships#many-to-any-m2a).

Useful in many different contexts including
[creating re-usable page components](/use-cases/headless-cms/create-reusable-page-components-using-m2a).

- **Creating Items**: Allow users to create new Items in the M2A collection.
- **Selecting Items**: Allow users to select existing files in the M2A collection.
- **Per Page**: The number of Items to show per page.
- **Allow Duplicates**: Allow users to add the same Item multiple times.

## Many To Many

Interface that allows users to create relationships between the current item and many different items from a single
collection.

This field will create a [Many-To-Many (M2M)](/configuration/data-model/relationships#many-to-many-m2m) junction
collection when added to the [Data Model](/configuration/data-model) for your
[Collection](/configuration/data-model/collections).

- **Layout**: `List`, `Table`
- **Creating Items**: Allow users to create new Items in the M2M collection.
- **Selecting Items**: Allow users to select existing files in the M2M collection.
- **Per Page**: The number of Items to show per page.
- **Junction Fields Location**: `Top`, `Bottom`
- **Allow Duplicates**: Allow users to add the same Item multiple times.
- **Filter**: [Filter Rule](/reference/filter-rules) to filter down the list of Items a user can select.
- **Item link**: Show a link to the item.

## One to Many

Interface that allows users to create a relationship between the current item and many items from a single collection.

Adding a One To Many field to the data model will create a corresponding Many to One field in the child collection. See
[One-to-Many (O2M) Relationships](/configuration/data-model/relationships#one-to-many-o2m).

- **Layout**: `List`, `Table`
- **Creating Items**: Allow users to create new Items in the M2A collection.
- **Selecting Items**: Allow users to select existing files in the M2A collection.
- **Per Page**: The number of Items to show per page.
- **Junction Fields Location**: `Top`, `Bottom`
- **Allow Duplicates**: Allow users to add the same Item multiple times.
- **Filter**: [Filter Rule](/reference/filter-rules) to filter down the list of Items a user can select.
- **Item link**: Show a link to the item.

## Tree View

Special One-to-Many (O2M) interface that allows users to create and manage recursive relationships between items from
the same collection.

The Tree View interface is only available on self-referencing (recursive) relationships. See
[Many-to-Any (O2M) Relationships](/configuration/data-model/relationships#many-to-any-m2a) and
[Build a Content Hierarchy](/cookbook/data-models/build-a-content-hierarchy).

- [**Display Template**](/app/display-templates): Fields or custom text that represent the specific item through various
  places in the App Studio.
- **Creating Items**: Allow users to create new Items in the collection.
- **Selecting Items**: Allow users to select existing files in the collection.
- **Filter**: [Filter Rule](/reference/filter-rules) to filter down the list of Items a user can select.

## Many to One

Interface that allows users to create a relationship between the current item and a single item from a single
collection.

See [Many-to-One (M20) Relationships](/configuration/data-model/relationships#many-to-one-m2o)

- [**Display Template**](/app/display-templates): Fields or custom text that represent the specific item through various
  places in the App Studio.
- **Creating Items**: `Enable Create Button`
- **Selecting Items**: `Enable Select Button`
- **Filter**: [Filter Rule](/reference/filter-rules) to filter down the list of Items a user can select.

## Translations

Special relational Interface designed specifically to handle translations. See
[Translations (O2M)](/configuration/data-model/relationships#translations-o2m).

- **Language Indicator Field**: The field from your `languages` collection that identifies the language to the user.
- **Language Direction Field**: The field from your `languages` collection that identifies the text direction for a
  selected language.
- **Default Language**: Default language to use.
- **Use Current User Language**: Default to the current users language.
