import { BaseException } from '@directus9/exceptions';

export class InvalidOTPException extends BaseException {
	constructor(message = 'Invalid user OTP.') {
		super(message, 401, 'INVALID_OTP');
	}
}
