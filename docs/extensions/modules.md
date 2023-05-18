---
description: A guide on how to build custom Modules in Directus.
readTime: 5 min read
---

# Custom Modules <small></small>

> Custom Modules are completely open-ended components that allow you to create new experiences within the Directus
> platform. [Learn more about Modules](/getting-started/glossary#modules).

## Extension Entrypoint

The entrypoint of your module is the `index` file inside the `src/` folder of your extension package. It exports a
configuration object with options to configure the behavior of your module. When loading your module, this object is
imported by the Directus host.

Example of an entrypoint:

```js
import ModuleComponent from './module.vue';

export default {
	id: 'custom',
	name: 'Custom',
	icon: 'box',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
	],
};
```

#### Available Options

- `id` — The unique key for this module. It is good practice to scope proprietary modules with an author prefix.
- `name` — The human-readable name for this module.
- `icon` — An icon name from the [material icon set](/getting-started/glossary#material-icons), or the extended list of
  Directus custom icons.
- `color` — A color associated with the module.
- `routes` — Details the routes in your module. The routes are registered as nested routes with the module's `id`
  serving as the base path.
- `hidden` — A boolean that indicates if the module should be hidden from the module bar.
- `preRegisterCheck` — A function that receives the current user as the first parameter and the permissions of this user
  as the second parameter. It should return a boolean that indicates if the check succeeded.

## Routes Array

The `routes` array of a module works very similar to Vue Router's `routes` array. The only difference is that the
module's routes are registered as child routes of the `/<module-id>` route.

The `routes` array should contain one or more route objects with a `path` property. Because the routes are registered as
child routes, the `path` property should be a relative path without a leading slash. As the button in the module bar
corresponding to your module links to the `/<module-id>` route, the `routes` array should contain a _root_ route with an
empty path.

If a route should render something, the route object should have a `component` property with a reference to a route
component.

To learn more about the properties of route objects, you can refer to the
[Vue Router Docs](https://next.router.vuejs.org/guide).

## Route Component

A single module can have multiple route components registered under different routes. Whenever a certain route is
visited, the corresponding route component is rendered, occupying the whole browser window. The route component has to
be Vue component. The most straightforward way to write a Vue component is to use the Vue Single File Component syntax.

Example of a route component using the Vue SFC syntax:

```vue
<template>
	<private-view title="My Custom Module">Content goes here...</private-view>
</template>

<script>
export default {};
</script>
```

A route component provides a blank canvas for creating anything you need. You can use the globally registered
`private-view` component to get access to Directus' page structure consisting of the module bar, the navigation, the
sidebar, the header and the main content area.

::: warning Enable the Module

Before a module appears in the module bar, it has to be enabled inside the project settings.

:::

::: warning Vue Version

The Directus App uses Vue 3. There might be 3rd party libraries that aren't yet compatible with Vue 3.

:::

## Accessing Internal Systems

To access internal systems like the API or the stores, you can use the `useApi()` and `useStores()` composables exported
by the `@directus9/extensions-sdk` package. They can be used inside a `setup()` function like this:

```js
import { useApi, useStores } from '@directus9/extensions-sdk';

export default {
	setup() {
		const api = useApi();

		const { useCollectionsStore } = useStores();
		const collectionsStore = useCollectionsStore();

		// ...
	},
};
```

::: tip Vue Options API

If you prefer to use the Vue Options API, you can inject the `api` and `stores` properties directly.

:::

## Example: Accessing the API from within your extension

The Directus App's Vue app instance provides a field called `api`, which can be injected into Vue components using
[Vue's inject framework](https://v3.vuejs.org/guide/component-provide-inject.html). This `api` field contains a property
called `api`, which is an authenticated Axios instance. Here's an example of how to use it:

```vue
<template>
	<private-view title="Example Collection List">
		<v-list>
			<v-list-item v-for="col in collections" v-bind:key="col.collection">
				{{ col.collection }}
			</v-list-item>
		</v-list>
		<v-button v-on:click="logToConsole">Log collections to console</v-button>
	</private-view>
</template>

<script>
export default {
	data() {
		return {
			collections: null,
		};
	},
	methods: {
		logToConsole: function () {
			console.log(this.collections);
		},
	},
	inject: ['api'],
	mounted() {
		// log the system field so you can see what attributes are available under it
		// remove this line when you're done.
		console.log(this.api);

		// Get a list of all available collections to use with this module
		this.api.get('/collections?limit=-1').then((res) => {
			this.collections = res.data.data;
		});
	},
};
</script>
```

In the above example, you can see that:

- The `api` field gets injected into the component and becomes available as an attribute of the component (i.e.,
  `this.api`)
- When the component is mounted, it uses `this.api.get` to request a list of all available collections
- The names of the collections are rendered into a list in the component's template
- a button is added with a method that logs all the data for the collections to the console

This is just a basic example. A more efficient way to access and work with the list of collections would be to get an
instance of the `collectionsStore` using the provided `stores` and accessing `stores.useCollectionsStore()`, but that's
beyond the scope of this guide.
