---
description: A guide on how to build custom API endpoints in Directus.
readTime: 3 min read
---

# Custom API Endpoints <small></small>

> Custom API Endpoints register new API routes which can be used to infinitely extend the core functionality of the
> platform.

## Extension Entrypoint

The entrypoint of your endpoint is the `index` file inside the `src/` folder of your extension package. It exports a
register function to register one or more custom routes. Each route of your endpoint will be a sub-route of
`/<extension-name>`.

::: tip Extension Name

The extension name is usually the name of the folder where you put your extension when deploying it.

:::

Example of an entrypoint:

```js
export default (router) => {
	router.get('/', (req, res) => res.send('Hello, World!'));
};
```

Alternatively, you can export a configuration object to be able to customize the root route:

```js
export default {
	id: 'greet',
	handler: (router) => {
		router.get('/', (req, res) => res.send('Hello, World!'));
		router.get('/intro', (req, res) => res.send('Nice to meet you.'));
		router.get('/goodbye', (req, res) => res.send('Goodbye!'));
	},
};
```

The routes of this endpoint are accessible at `/greet`, `/greet/intro` and `/greet/goodbye`.

#### Available Options

- `id` — The unique key for this endpoint. Each route of your endpoint will be a sub-route of `/<id>`.
- `handler` — The endpoint's registration handler function.

## Register Function

The register function receives the two parameters `router` and `context`. `router` is an Express router instance.
`context` is an object with the following properties:

- `services` — All API internal services.
- `exceptions` — API exception objects that can be used to throw "proper" errors.
- `database` — Knex instance that is connected to the current database.
- `getSchema` — Async function that reads the full available schema for use in services
- `env` — Parsed environment variables.
- `logger` — [Pino](https://github.com/pinojs/pino) instance.
- `emitter` — [Event emitter](https://github.com/LaWebcapsule/directus9/blob/main/api/src/emitter.ts) instance that can be
  used to trigger custom events for other extensions.

::: warning Event loop

When implementing custom events using the emitter make sure you never directly or indirectly emit the same event your
hook is currently handling as that would result in an infinite loop!

:::

## Example: Recipes

```js
export default (router, { services, exceptions }) => {
	const { ItemsService } = services;
	const { ServiceUnavailableException } = exceptions;

	router.get('/', (req, res, next) => {
		const recipeService = new ItemsService('recipes', { schema: req.schema, accountability: req.accountability });

		recipeService
			.readByQuery({ sort: ['name'], fields: ['*'] })
			.then((results) => res.json(results))
			.catch((error) => {
				return next(new ServiceUnavailableException(error.message));
			});
	});
};
```
