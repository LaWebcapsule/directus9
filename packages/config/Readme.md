# @db-studio/config

Shared configuration files for DB Studio packages.

Includes configruations for the the following tools:

- Prettier
- Typescript
- ESLint
- Stylelint

## Usage

```
pnpm add @db-studio/config
```

### Typescript
In your `tsconfig.json`:

```json
	"extends": "@db-studio/config/tsconfig/node18-esm.json"
```

