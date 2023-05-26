---
description: A guide on how to setup your owns custom Migrations in Directus.
readTime: 2 min read
---

# Custom Migrations

> Directus allows adding custom migration files that run whenever the `directus database migrate:*` commands are
> executed. All migrations must reside in the `extensions/migrations` folder.

## File Name

The file name follows the following structure:

```
[identifier]-[name].js
```

for example:

```
20201202A-my-custom-migration.js
```

## Structure

Migrations have to export an `up` and a `down` function. These functions get a [Knex](http://knexjs.org) instance that
can be used to do virtually whatever.

```js
module.exports = {
	async up(knex) {
		await knex.schema.createTable('test', (table) => {
			table.increments();
			table.string('rijk');
		});
	},

	async down(knex) {
		await knex.schema.dropTable('test');
	},
};
```

::: danger Danger

Seeing that these migrations are a bit of a free-for-all, you can really harm your database. Please make sure you know
what you're doing and backup your database before adding these migrations.

:::

## Migrations and Directus schema

Migrations can be used to manage the contents of Directus collections (e.g. initial hydration). In order to do it, you
must ensure that the schema is up to date before running your migrations.

`directus database migrate:latest` runs the required Directus internal migrations and the migrations from `migrations`
directory. In general, you need the following flow:

```sh
# Option 1
npx directus bootstrap
npx directus schema apply ./path/to/snapshot.yaml

# Option 2 - without bootstrap, you must ensure that you run all required `bootstrap` tasks
npx directus database install
npx directus database migrate:latest
npx directus schema apply ./path/to/snapshot.yaml
```

Take notice here - to comply with this flow, `migrations` directory **must not contain** tasks that modify the contents
of your Directus, because schema is not yet created when you run `migrate:latest`.
