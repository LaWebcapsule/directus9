import type { FieldFunction, Type } from '@wbce-d9/types';

export function getOutputTypeForFunction(fn: FieldFunction): Type {
	const typeMap: Record<FieldFunction, Type> = {
		year: 'integer',
		month: 'integer',
		week: 'integer',
		day: 'integer',
		weekday: 'integer',
		hour: 'integer',
		minute: 'integer',
		second: 'integer',
		count: 'integer',
	};

	return typeMap[fn];
}
