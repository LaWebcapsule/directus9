import argon2 from 'argon2';
import { getConfigFromEnv } from './get-config-from-env.js';

export function generateHash(stringToHash: string): Promise<string> {
	const argon2HashConfigOptions = getConfigFromEnv('HASH_', 'HASH_RAW'); // Disallow the HASH_RAW option, see https://github.com/LaWebcapsule/directus9/discussions/7670#discussioncomment-1255805

	// associatedData, if specified, must be passed as a Buffer to argon2.hash, see https://github.com/ranisalt/node-argon2/wiki/Options#associateddata
	'associatedData' in argon2HashConfigOptions &&
		(argon2HashConfigOptions['associatedData'] = Buffer.from(argon2HashConfigOptions['associatedData']));

	return argon2.hash(stringToHash, argon2HashConfigOptions);
}
