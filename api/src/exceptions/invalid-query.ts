import { BaseException } from '@wbce-d9/exceptions';

export class InvalidQueryException extends BaseException {
	constructor(message: string) {
		super(message, 400, 'INVALID_QUERY');
	}
}
