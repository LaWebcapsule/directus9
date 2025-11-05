// Alias types
export * as SchemaAlias from './alias/index.ts';

// Integer types
export * as SchemaInteger from './integer/index.ts';
export * as SchemaBigInteger from './big-integer/index.ts';
export * as SchemaDecimal from './decimal/index.ts';
export * as SchemaFloat from './float/index.ts';

// String types
export * as SchemaString from './string/index.ts';
export * as SchemaCSV from './csv/index.ts';
export * as SchemaHash from './hash/index.ts';
export * as SchemaText from './text/index.ts';

// DateTime types
export * as SchemaDateTime from './date-time/index.ts';
export * as SchemaDate from './date/index.ts';
export * as SchemaTime from './time/index.ts';
export * as SchemaTimestamp from './timestamp/index.ts';

// Boolean types
export * as SchemaBoolean from './boolean/index.ts';

// JSON types
export * as SchemaJSON from './json/index.ts';

// UUID types
export * as SchemaUUID from './uuid/index.ts';

export const SchemaAvailableTypes = [
	'alias',
	'bigInteger',
	'boolean',
	'csv',
	'date',
	'datetime',
	'decimal',
	'float',
	'geometry',
	'hash',
	'integer',
	'json',
	'string',
	'text',
	'time',
	'timestamp',
	'uuid',
];

export type GeneratedFilter = {
	operator: string;
	value: any;
	filter: any;
	validatorFunction: (inputValue: any, possibleValues: any) => boolean;
	emptyAllowedFunction: (inputValue: any, possibleValues: any) => boolean;
};
