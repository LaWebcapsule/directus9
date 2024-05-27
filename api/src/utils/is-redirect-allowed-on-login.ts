import env from '../env.js';
import { toArray } from '@wbce-d9/utils';
import isUrlAllowed from './is-url-allowed.js';

function isUrlValid(string: unknown) {
	try {
	  new URL(string as string);
	  return true;
	} catch (err) {
	  return false;
	}
  }

/**
 * Checks if the defined redirect after successful SSO login is in the allow list
 */
export function isRedirectAllowedOnLogin(redirect: unknown, provider: string): boolean {
	if (!redirect) return true; // empty redirect
	if (typeof redirect !== 'string') return false; // invalid type

	const publicUrl = env['PUBLIC_URL'] as string;

	if (isUrlValid(redirect) === false) {
		if (redirect.startsWith('//') === false) {
			// should be a relative path like `/admin/test`
			return true;
		}

		// domain without protocol `//example.com/test`
		return false;
	}

	const { protocol: redirectProtocol, hostname: redirectDomain } = new URL(redirect);

	const envKey = `AUTH_${provider.toUpperCase()}_REDIRECT_ALLOW_LIST`;

	if (envKey in env) {
		try {
			if (isUrlAllowed(redirect, [...toArray(env[envKey] as string), publicUrl])) return true;
		} catch(error) {
			console.error(error);
			return true;
		}

		
	}

	if (isUrlValid(publicUrl) === false) {
		return false;
	}

	// allow redirects to the defined PUBLIC_URL
	const { protocol: publicProtocol, hostname: publicDomain } = new URL(publicUrl);

	return `${redirectProtocol}//${redirectDomain}` === `${publicProtocol}//${publicDomain}`;
}