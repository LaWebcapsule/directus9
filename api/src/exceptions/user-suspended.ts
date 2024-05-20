import { BaseException } from '@db-studio/exceptions';

export class UserSuspendedException extends BaseException {
	constructor(message = 'User suspended.') {
		super(message, 401, 'USER_SUSPENDED');
	}
}
