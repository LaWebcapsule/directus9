import type { Driver } from '@directus9/storage';

export const _aliasMap: Record<string, string> = {
	local: '@directus9/storage-driver-local',
	s3: '@directus9/storage-driver-s3',
	gcs: '@directus9/storage-driver-gcs',
	azure: '@directus9/storage-driver-azure',
	cloudinary: '@directus9/storage-driver-cloudinary',
};

export const getStorageDriver = async (driverName: string): Promise<typeof Driver> => {
	if (driverName in _aliasMap) {
		driverName = _aliasMap[driverName]!;
	} else {
		throw new Error(`Driver "${driverName}" doesn't exist.`);
	}

	return (await import(driverName)).default;
};
