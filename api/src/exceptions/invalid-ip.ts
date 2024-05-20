import { BaseException } from '@db-studio/exceptions';

export class InvalidIPException extends BaseException {
	constructor(message = 'Invalid IP address.') {
		super(message, 401, 'INVALID_IP');
	}
}
