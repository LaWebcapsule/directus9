# Selection

> Interfaces are how users interact with fields on the Item Detail page. These are the standard Selection interfaces.

## Toggle

A checkbox input that allows user to toggle value between on and off / true and false.

- **Types**: `Boolean`
- **Default Value**: `true`, `false`, `null`
- **Icon On**: Icon that shows whenever the toggle is enabled.
- **Icon Off**: Icon that shows whenever the toggle is disabled.
- **Color On**: Color of the icon whenever the toggle is enabled.
- **Color Off**: Color of the icon whenever the toggle is disabled.
- **Label**: The text displayed to the user beside the toggle.

## Datetime

Date picker input that allows user to select a date and time.

- **Types**: `DateTime`, `Date`, `Time`, `Timestamp`
- **Include Seconds**: Show seconds in the interface
- **Use 24-Hour Format**: Use 24 hour time system instead of 12 hour

## Repeater

Interface for repeating groups of fields.

You can use any [Text & Number](/configuration/data-model/fields/text-numbers),
[Selection](/configuration/data-model/fields/selection), or [Other](/configuration/data-model/fields/other) fields
within a Repeater. [Relational](/configuration/data-model/fields/relational.md),
[Presentation](/configuration/data-model/fields/presentation.md), or [Group](/configuration/data-model/fields/groups.md)
fields are not allowed.

Value is stored as a JSON array of objects.

- **Types**: `JSON`
- **Template**: Add a JSON template that users that add to the field with a button click.
- **"Create New" Label**: Label for the Create New button below the field on Item Detail page.
- **Sort**: Method of sorting the items groups within the repeater.
- **Edit Fields**: The configuration for fields within the Repeater.
  - **Field**: Name of the field.
  - **Field Width**: Width of field on the Item Detail page.
  - **Type**: Type of value.
  - **Interface**: The interface to use for the fields.
  - **Note**: A helpful note for the user.
  - **Options**: Option configuration for the selected Interface.

## Map

Interface that shows geospatial data on an interactive map.

- **Types**: `Point`, `LineString`, `Polygon`, `Multipoint`, `MultiLineString`, `MultiPolygon`, `Geometry (All)`, `JSON`
- **Default View**: The default location and zoom settings on the map to show by default

## Color

A color picker interface that allows users to input color codes and convert between different color modes.

- **Types**: `String`
- **Opacity**: Enable opacity values to be adjusted by the user.
- **Preset Colors**: Preset colors that users can select.

## Dropdown

Input that allows user to select a value from a list of options.

- **Types**: `String`, `Integer`, `Big Integer`, `Float`
- **Choices**: Options for the dropdown.
  - **Text**: Label the user sees.
  - **Value**: Raw value that gets stored.
- **Allow Other**: Allow user to enter custom values other than preset values.
- **Allow None**: Allow user to deselect an option.
- **Icon**: Icon displayed beside the dropdown.
- **Placeholder**: Placeholder text for the dropdown.

## Icon

Search input that allows user to select from a list of icons.

- **Types**: `String`

## Checkboxes

Input that allows user to select multiple checkboxes.

- **Types**: `JSON`, `CSV`
- **Choices**: Options for the checkboxes.
  - **Text**: Label the user sees.
  - **Value**: Raw value that gets stored.
- **Allow Other**: Allow user to enter custom values other than preset Choices.
- **Color**: Color of the checkboxes.
- **Icon On**: Icon that shows whenever a checkbox is checked.
- **Icon Off**: Icon that shows whenever a checkbox is unchecked.
- **Items Shown**: Number of checkboxes shown.

## Checkboxes (Tree)

Nested tree of checkboxes that can be expanded or collapsed.

- **Types**: `JSON`, `CSV`
- **Choices**: Options for the checkbox tree.
  - **Text**: Label the user sees.
  - **Value**: Raw value that gets stored.
  - **Children**: Child checkboxes nested below the current choice.
- **Value Combining**: Controls what value is stored when nested selections are made.

## Dropdown (Multiple)

Input that allows user to select multiple values from a list of options.

- **Types**: `JSON`, `CSV`
- **Choices**: Options for the dropdown.
  - **Text**: Label the user sees.
  - **Value**: Raw value that gets stored.
- **Allow Other**: Allow user to enter custom values other than preset choices.
- **Allow None**: Allow user to deselect an option.
- **Icon**: Icon displayed beside the dropdown.
- **Placeholder**: Placeholder text for the dropdown.

## Radio Buttons

Radio button input that allows users to select a single value from multiple choices.

- **Types**: `String`, `Integer`, `Big Integer`, `Float`
- **Choices**: Options for the radio buttons.
  - **Text**: Label the user sees.
  - **Value**: Raw value that gets stored.
- **Allow Other**: Allow user to enter custom values other than preset choices.
- **Color**: Color of the radio buttons.
- **Icon On**: Icon that shows whenever a radio buttons is checked.
- **Icon Off**: Icon that shows whenever a radio buttons is unchecked.
