import api, * as apiFunctions from '@/api';
import * as setLanguageDefault from '@/lang/set-language';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';
import { afterEach, beforeAll, beforeEach, describe, expect, SpyInstance, test, vi } from 'vitest';

beforeEach(() => {
	setActivePinia(
		createTestingPinia({
			createSpy: vi.fn,
			stubActions: false,
		})
	);
});

import { Auth, Info, useServerStore } from './server';
import { useUserStore } from './user';

const mockServerInfo: Info = {
	project: {
		project_name: 'Directus9',
		project_descriptor: null,
		project_logo: null,
		project_color: null,
		default_language: 'de-DE',
		public_foreground: null,
		public_background: null,
		public_note: null,
		custom_css: null,
	},
	directus9: {
		version: '10.10.10',
	},
	node: {
		version: '20.0.0',
		uptime: 123,
	},
	os: {
		type: 'Test OS',
		version: '10.10.10',
		uptime: 10000,
		totalmem: 12345678,
	},
};

const mockAuthProviders: Auth['providers'] = [
	{
		name: 'directus9',
		driver: 'oauth2',
	},
];

const mockAdminUser = { id: 'e7f7a94d-5b38-4978-8450-de0e38859fec' } as any;

const mockAdminUserWithLanguage = { id: 'e7f7a94d-5b38-4978-8450-de0e38859fec', language: 'zh-CN' } as any;

let apiGetSpy: SpyInstance;
let replaceQueueSpy: SpyInstance;
let setLanguageSpy: SpyInstance;

beforeAll(() => {
	apiGetSpy = vi.spyOn(api, 'get');
	replaceQueueSpy = vi.spyOn(apiFunctions, 'replaceQueue').mockResolvedValue();
	setLanguageSpy = vi.spyOn(setLanguageDefault, 'setLanguage').mockResolvedValue(true);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('hydrate action', async () => {
	test('should hydrate info', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: mockServerInfo,
					},
				});
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const serverStore = useServerStore();
		await serverStore.hydrate();

		expect(serverStore.info).toEqual(mockServerInfo);
	});

	test('should hydrate auth', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				// stub as server info is not tested here
				return Promise.resolve({ data: {} });
			}

			if (path === '/auth') {
				return Promise.resolve({
					data: {
						data: mockAuthProviders,
						disableDefault: true,
					},
				});
			}
		});

		const serverStore = useServerStore();

		// test initial values
		expect(serverStore.auth.providers).toEqual([]);
		expect(serverStore.auth.disableDefault).toEqual(false);

		await serverStore.hydrate();

		expect(serverStore.auth.providers).toEqual(mockAuthProviders);
		expect(serverStore.auth.disableDefault).toEqual(true);
	});

	test('should set default language en-US when there is no logged in user', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				// stub as server info is not tested here
				return Promise.resolve({ data: {} });
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const serverStore = useServerStore();
		await serverStore.hydrate();

		expect(setLanguageSpy).toHaveBeenCalledWith('en-US');
	});

	test('should set configured default language when there is no logged in user', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: mockServerInfo,
					},
				});
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const serverStore = useServerStore();
		await serverStore.hydrate();

		expect(setLanguageSpy).toHaveBeenCalledWith(mockServerInfo.project?.default_language);
	});

	test('should set updated default language for admin user', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: mockServerInfo,
					},
				});
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const userStore = useUserStore();
		userStore.currentUser = mockAdminUser;

		const serverStore = useServerStore();
		await serverStore.hydrate({ isLanguageUpdated: true });

		expect(setLanguageSpy).toHaveBeenCalledOnce();
	});

	test('should not set updated default language for admin user', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: mockServerInfo,
					},
				});
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const userStore = useUserStore();
		userStore.currentUser = mockAdminUser;

		const serverStore = useServerStore();
		await serverStore.hydrate();

		expect(setLanguageSpy).not.toHaveBeenCalled();
	});

	test('should not set updated default language for admin user with configured language', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: mockServerInfo,
					},
				});
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const userStore = useUserStore();
		userStore.currentUser = mockAdminUserWithLanguage;

		const serverStore = useServerStore();
		await serverStore.hydrate();

		expect(setLanguageSpy).not.toHaveBeenCalled();
	});

	test('should not call replaceQueue when there is no rateLimit', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: {},
					},
				});
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const serverStore = useServerStore();
		await serverStore.hydrate();

		expect(replaceQueueSpy).not.toHaveBeenCalled();
	});

	test('should call replaceQueue without arguments when rateLimit is false', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: { rateLimit: false },
					},
				});
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const serverStore = useServerStore();
		await serverStore.hydrate();

		expect(replaceQueueSpy).toHaveBeenCalledWith();
	});

	test('should call replaceQueue with arguments when rateLimit is configured', async () => {
		const mockRateLimit = {
			duration: 10,
			points: 20,
		};

		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: {
							rateLimit: mockRateLimit,
						},
					},
				});
			}

			if (path === '/auth') {
				// stub as auth is not tested here
				return Promise.resolve({ data: {} });
			}
		});

		const serverStore = useServerStore();
		await serverStore.hydrate();

		expect(replaceQueueSpy).toHaveBeenCalledWith({
			intervalCap: mockRateLimit.points - 10,
			interval: mockRateLimit.duration * 1000,
			carryoverConcurrencyCount: true,
		});
	});
});

describe('dehyrate action', () => {
	test('should reset store', async () => {
		apiGetSpy.mockImplementation((path: string) => {
			if (path === '/server/info') {
				return Promise.resolve({
					data: {
						data: mockServerInfo,
					},
				});
			}

			if (path === '/auth') {
				return Promise.resolve({
					data: {
						data: mockAuthProviders,
						disableDefault: true,
					},
				});
			}
		});

		const serverStore = useServerStore();
		await serverStore.hydrate();
		serverStore.dehydrate();

		expect(serverStore.info.project).toEqual(null);
		expect(serverStore.info.directus9).toEqual(undefined);
		expect(serverStore.info.node).toEqual(undefined);
		expect(serverStore.info.os).toEqual(undefined);
		expect(serverStore.auth.providers).toEqual([]);
		expect(serverStore.auth.disableDefault).toEqual(false);
	});
});
