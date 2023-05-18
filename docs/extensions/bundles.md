---
description: A guide on how to build extension bundles in Directus9.
readTime: 5 min read
---

# Extension Bundles

> Extension bundles allow you to combine and share dependencies between one or more extensions.

## Create a Bundle

When [scaffolding your Directus9 extension](/extensions/creating-extensions.html#scaffolding-your-directus9-extension),
select the `bundle` type. This will create a new empty bundle.

## Entries

In your bundle's `package.json` file, the `directus9:extension` object has an `entries` array that describes all of the
items contained within the bundle.

Example of an entry:

```json
{
	"type": "interface",
	"name": "my-interface",
	"source": "src/my-interface/index.ts"
}
```

Entries in a bundle are located within a `src` directory in the bundle.

## Add New Extensions To a Bundle

### Create New

1. Navigate to your bundle extension directory in your terminal.
2. Use the `npm run add` command and select an extension type.

This will scaffold a new blank extension for you to work on.

:::tip

The bundle extension type currently doesn't support the migration extension type.

:::

### Add Existing

1. Move your extension directory within your bundle's `src` directory.
2. Add an entry to the bundle's `package.json`.

## Remove an Extension From a Bundle

1. Delete the extension directory from your `src` directory.
2. Remove the entry from your `package.json`.
