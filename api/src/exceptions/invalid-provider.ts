import { BaseException } from '@wbce-d9/exceptions';

export class InvalidProviderException extends BaseException {
	constructor(message = 'Invalid provider.') {
		super(message, 403, 'INVALID_PROVIDER');
	}
}
