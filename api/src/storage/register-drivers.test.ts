import { randWord } from '@ngneat/falso';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { getEnv } from '../env.js';
import { getStorageDriver } from './get-storage-driver.js';
import { registerDrivers } from './register-drivers.js';
import type { Driver, StorageManager } from '@directus9/storage';

vi.mock('./get-storage-driver.js');
vi.mock('../env');

let mockStorage: StorageManager;
let mockDriver: typeof Driver;

let sample: {
	name: string;
};

beforeEach(() => {
	mockStorage = {
		registerDriver: vi.fn(),
	} as unknown as StorageManager;

	mockDriver = {} as unknown as typeof Driver;

	vi.mocked(getStorageDriver).mockResolvedValue(mockDriver);

	sample = {
		name: randWord(),
	};
});

afterEach(() => {
	vi.resetAllMocks();
});

test('Does nothing if no storage drivers are configured in Env', async () => {
	vi.mocked(getEnv).mockReturnValue({});

	await registerDrivers(mockStorage);

	expect(mockStorage.registerDriver).toHaveBeenCalledTimes(0);
});

test('Ignores environment variables that do not start with STORAGE_ and end with _DRIVER', async () => {
	vi.mocked(getEnv).mockReturnValue({
		[`NOSTORAGE_${randWord().toUpperCase()}_DRIVER`]: randWord(),
		[`STORAGE_${randWord().toUpperCase()}_NODRIVER`]: randWord(),
	});

	await registerDrivers(mockStorage);

	expect(mockStorage.registerDriver).toHaveBeenCalledTimes(0);
});

test('Only registers driver once per library', async () => {
	vi.mocked(getEnv).mockReturnValue({
		[`STORAGE_${randWord().toUpperCase()}_DRIVER`]: sample.name,
		[`STORAGE_${randWord().toUpperCase()}_DRIVER`]: sample.name,
	});

	await registerDrivers(mockStorage);

	expect(mockStorage.registerDriver).toHaveBeenCalledOnce();
});

test('Gets storage driver for name', async () => {
	vi.mocked(getEnv).mockReturnValue({
		[`STORAGE_${randWord().toUpperCase()}_DRIVER`]: sample.name,
	});

	await registerDrivers(mockStorage);

	expect(getStorageDriver).toHaveBeenCalledWith(sample.name);
});

test('Registers storage driver to manager', async () => {
	vi.mocked(getEnv).mockReturnValue({
		[`STORAGE_${randWord().toUpperCase()}_DRIVER`]: sample.name,
	});

	await registerDrivers(mockStorage);

	expect(mockStorage.registerDriver).toHaveBeenCalledWith(sample.name, mockDriver);
});
