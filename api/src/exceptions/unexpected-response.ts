import { BaseException } from '@db-studio/exceptions';

export class UnexpectedResponseException extends BaseException {
	constructor(message: string) {
		super(message, 503, 'UNEXPECTED_RESPONSE');
	}
}
