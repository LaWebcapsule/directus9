import { BaseException } from '@directus9/exceptions';

type Extensions = {
	service: string;
	[key: string]: any;
};

export class ServiceUnavailableException extends BaseException {
	constructor(message: string, extensions: Extensions) {
		super(message, 503, 'SERVICE_UNAVAILABLE', extensions);
	}
}
