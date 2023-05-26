import type { StorageManager } from '@wbce-d9/storage';
import { toArray } from '@wbce-d9/utils';
import { getEnv } from '../env.js';
import { getConfigFromEnv } from '../utils/get-config-from-env.js';

export const registerLocations = async (storage: StorageManager) => {
	const env = getEnv();

	const locations = toArray(env['STORAGE_LOCATIONS']);

	locations.forEach((location: string) => {
		location = location.trim();
		const driverConfig = getConfigFromEnv(`STORAGE_${location.toUpperCase()}_`);
		const { driver, ...options } = driverConfig;
		storage.registerLocation(location, { driver, options });
	});
};
