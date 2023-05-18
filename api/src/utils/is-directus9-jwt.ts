import jwt from 'jsonwebtoken';

/**
 * Check if a given string conforms to the structure of a JWT
 * and whether it is issued by Directus9.
 */
export default function isDirectus9JWT(string: string): boolean {
	try {
		const payload = jwt.decode(string, { json: true });
		if (payload?.iss !== 'directus9') return false;
		return true;
	} catch {
		return false;
	}
}
