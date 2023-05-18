import * as exceptions from '@directus9/exceptions';

const { BaseException } = exceptions;

export class ForbiddenException extends BaseException {
	constructor() {
		super(`You don't have permission to access this.`, 403, 'FORBIDDEN');

		/**
		 * We currently don't show the reason for a forbidden exception in the API output, as that
		 * has the potential to leak schema information (eg a "No permission" vs "No permission to files"
		 * would leak that a thing called "files" exists.
		 * Ref https://github.com/directus9/directus9/discussions/4368
		 */
	}
}
