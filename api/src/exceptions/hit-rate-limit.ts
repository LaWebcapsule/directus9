import { BaseException } from '@directus9/exceptions';

type Extensions = {
	limit: number;
	reset: Date;
};

export class HitRateLimitException extends BaseException {
	constructor(message: string, extensions: Extensions) {
		super(message, 429, 'REQUESTS_EXCEEDED', extensions);
	}
}
