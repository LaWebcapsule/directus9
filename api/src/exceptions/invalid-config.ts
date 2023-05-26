import { BaseException } from '@wbce-d9/exceptions';

export class InvalidConfigException extends BaseException {
	constructor(message = 'Invalid config', extensions?: Record<string, any>) {
		super(message, 503, 'INVALID_CONFIG', extensions);
	}
}
