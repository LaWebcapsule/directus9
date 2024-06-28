import { toArray } from '@wbce-d9/utils';
import logger from '../logger.js';
import { URL } from 'url';

/**
 * Check if url matches allow list either exactly or by origin+pathname
 */
export default function isUrlAllowed(url: string, allowList: string | string[]): boolean {
	const urlAllowList = toArray(allowList);

	if (urlAllowList.includes(url)) return true;

	const parsedWhitelist = urlAllowList
		.map((allowedURL) => {
			try {
				const { origin, pathname } = new URL(allowedURL);
				return origin + pathname;
			} catch {
				logger.warn(`Invalid URL used "${url}"`);
			}

			return null;
		})
		.filter((f) => f) as string[];

	try {
		const { origin, pathname } = new URL(url);
		return parsedWhitelist.includes(origin + pathname);
	} catch {
		return false;
	}
}
