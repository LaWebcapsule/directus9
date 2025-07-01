import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cryptoStub } from '@/__utils__/crypto';

vi.stubGlobal('crypto', cryptoStub);

import config from './index';

beforeEach(() => {
	setActivePinia(
		createTestingPinia({
			createSpy: vi.fn,
		})
	);
});

describe('Overview', () => {
	it('Renders empty array', () => {
		expect(config.overview()).toEqual([]);
	});
});
