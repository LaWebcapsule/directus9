import type { Driver } from '@wbce-d9/storage';

export const _aliasMap: Record<string, string> = {
	local: '@wbce-d9/storage-driver-local',
	s3: '@wbce-d9/storage-driver-s3',
	gcs: '@wbce-d9/storage-driver-gcs',
	azure: '@wbce-d9/storage-driver-azure',
	cloudinary: '@wbce-d9/storage-driver-cloudinary',
};

export const getStorageDriver = async (driverName: string): Promise<typeof Driver> => {
	if (driverName in _aliasMap) {
		driverName = _aliasMap[driverName]!;
	} else {
		throw new Error(`Driver "${driverName}" doesn't exist.`);
	}

	return (await import(driverName)).default;
};
