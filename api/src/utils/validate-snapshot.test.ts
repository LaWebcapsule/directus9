import { describe, expect, test, vi } from 'vitest';
import type { Snapshot } from '../types/snapshot.js';
import { validateSnapshot } from './validate-snapshot.js';

vi.mock('./package.js', () => ({
	version: '9.22.4',
}));

vi.mock('../database/index.js', () => ({
	getDatabaseClient: () => 'sqlite',
}));

describe('should fail on invalid snapshot schema', () => {
	test('empty snapshot', () => {
		const snapshot = {} as Snapshot;

		expect(() => validateSnapshot(snapshot)).toThrowError('"version" is required');
	});

	test('invalid version', () => {
		const snapshot = { version: 0 } as Snapshot;

		expect(() => validateSnapshot(snapshot)).toThrowError('"version" must be [1]');
	});

	test('invalid schema', () => {
		const snapshot = { version: 1, directus9: '9.22.4', collections: {} } as Snapshot;

		expect(() => validateSnapshot(snapshot)).toThrowError('"collections" must be an array');
	});
});

describe('should require force option on version / vendor mismatch', () => {
	test('directus9 version mismatch', () => {
		const snapshot = { version: 1, directus9: '9.22.3' } as Snapshot;

		expect(() => validateSnapshot(snapshot)).toThrowError(
			"Provided snapshot's directus9 version 9.22.3 does not match the current instance's version 9.22.4"
		);
	});

	test('db vendor mismatch', () => {
		const snapshot = { version: 1, directus9: '9.22.4', vendor: 'postgres' } as Snapshot;

		expect(() => validateSnapshot(snapshot)).toThrowError(
			"Provided snapshot's vendor postgres does not match the current instance's vendor sqlite."
		);
	});
});

test('should allow bypass on version / vendor mismatch via force option ', () => {
	const snapshot = { version: 1, directus9: '9.22.3', vendor: 'postgres' } as Snapshot;

	expect(validateSnapshot(snapshot, true)).toBeUndefined();
});
