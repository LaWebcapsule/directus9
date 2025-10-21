# @wbce-d9/tsconfig

Shared TSConfig files used by the projects in the Directus ecosystem.

The following configs are available:

- [`node22`](./node22/tsconfig.json) - Config for ESM modules running under Node.js 22
- [`vue3`](./vue3/tsconfig.json) - Config for Vue.js 3 modules
- [`base`](./base/tsconfig.json) - Set of basic rules (included in all of the configs above)

## Usage

```
pnpm add @wbce-d9/tsconfig
```

To use one of the shared config, extend the local `tsconfig.json` from it:

```json
{
	"extends": "@directus/tsconfig/node22"
}
```