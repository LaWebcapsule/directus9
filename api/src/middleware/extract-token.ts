/**
 * Extract access token from:
 *
 * Authorization: Bearer
 * access_token query parameter
 * Access token cookie
 *
 * and store in req.token
 */

import type { RequestHandler } from 'express';
import env from '../env.js';

const extractToken: RequestHandler = (req, _res, next) => {
	let token: string | null = null;

	if (req.query && req.query['access_token']) {
		token = req.query['access_token'] as string;
	}

	if (req.headers && req.headers.authorization) {
		const parts = req.headers.authorization.split(' ');

		if (parts.length === 2 && parts[0]!.toLowerCase() === 'bearer') {
			token = parts[1]!;
		}
	}
	/**
	 * Check if there is an access token stored in the cookies
	 */

	if (req?.cookies?.[env['ACCESS_TOKEN_COOKIE_NAME'] as string]) {
		token = req.cookies[env['ACCESS_TOKEN_COOKIE_NAME'] as string];
	}

	/**
	 * @TODO
	 * Look into RFC6750 compliance:
	 * In order to be fully compliant with RFC6750, we have to throw a 400 error when you have the
	 * token in more than 1 place afaik. We also might have to support "access_token" as a post body
	 * key
	 */

	req.token = token;
	next();
};

export default extractToken;
