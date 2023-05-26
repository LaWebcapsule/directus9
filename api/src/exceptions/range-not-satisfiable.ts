import { BaseException } from '@wbce-d9/exceptions';
import type { Range } from '@wbce-d9/storage';

export class RangeNotSatisfiableException extends BaseException {
	constructor(range?: Range) {
		const rangeString =
			range && (range?.start !== undefined || range?.end !== undefined)
				? `"${range.start ?? ''}-${range.end ?? ''}" `
				: '';

		super(
			`Range ${rangeString}is invalid or the file's size doesn't match the requested range.`,
			416,
			'RANGE_NOT_SATISFIABLE'
		);
	}
}
