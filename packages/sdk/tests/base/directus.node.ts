/**
 * @jest-environment node
 */

import { Directus, MemoryStorage } from '../../src/base';

describe('node sdk', function () {
	const sdk = new Directus('http://example.com');

	it('has storage', function () {
		expect(sdk.storage).toBeInstanceOf(MemoryStorage);
	});
});
