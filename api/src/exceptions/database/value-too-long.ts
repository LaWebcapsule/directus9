import { BaseException } from '@db-studio/exceptions';

type Extensions = {
	collection: string;
	field: string | null;
};

export class ValueTooLongException extends BaseException {
	constructor(field: string | null, extensions?: Extensions) {
		if (field) {
			super(`Value for field "${field}" is too long.`, 400, 'VALUE_TOO_LONG', extensions);
		} else {
			super(`Value is too long.`, 400, 'VALUE_TOO_LONG', extensions);
		}
	}
}
