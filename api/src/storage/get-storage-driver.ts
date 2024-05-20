import type { Driver } from '@db-studio/storage';

export const _aliasMap: Record<string, string> = {
	local: '@db-studio/storage-driver-local',
	s3: '@db-studio/storage-driver-s3',
	gcs: '@db-studio/storage-driver-gcs',
	azure: '@db-studio/storage-driver-azure',
	cloudinary: '@db-studio/storage-driver-cloudinary',
};

export const getStorageDriver = async (driverName: string): Promise<typeof Driver> => {
	if (driverName in _aliasMap) {
		driverName = _aliasMap[driverName]!;
	} else {
		throw new Error(`Driver "${driverName}" doesn't exist.`);
	}

	return (await import(driverName)).default;
};
