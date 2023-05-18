import api from '@/api';
import { Settings } from '@directus9/types';
import { createTestingPinia } from '@pinia/testing';
import * as notifyUtil from '@/utils/notify';
import * as unexpectedErrorUtil from '@/utils/unexpected-error';
import { AxiosRequestConfig } from 'axios';
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

import { useSettingsStore } from './settings';
import { useUserStore } from './user';

const mockTranslationStrings: Settings['translation_strings'] = [
	{
		key: 'test_translation',
		translations: {
			'en-US': 'My Translation EN',
			'zh-CN': 'My Translation CN',
		},
	},
];

const mockSettings: Settings = {
	id: 1,
	project_name: 'Directus',
	project_url: null,
	project_color: null,
	project_logo: null,
	public_foreground: null,
	public_background: null,
	public_note: null,
	auth_login_attempts: 25,
	auth_password_policy: null,
	storage_asset_transform: 'all',
	storage_asset_presets: null,
	custom_css: null,
	storage_default_folder: null,
	basemaps: null,
	mapbox_key: null,
	module_bar: [],
	project_descriptor: null,
	translation_strings: [],
	default_language: 'en-US',
	custom_aspect_ratios: null,
};

const mockUser = { id: 'e7f7a94d-5b38-4978-8450-de0e38859fec', role: { admin_access: false } } as any;

const mockShareUser = { share: 'a6eff2c1-d26b-43b2-bafd-84bb58c3b8ce', role: { admin_access: false } } as any;

vi.mock('@/api', () => {
	return {
		default: {
			get: (path: string, config?: AxiosRequestConfig<any>) => {
				if (path === '/settings') {
					if (!config) {
						return Promise.resolve({
							data: {
								data: mockSettings,
							},
						});
					}

					if (config.params?.fields && config.params.fields.includes('translation_strings')) {
						return Promise.resolve({
							data: {
								data: Object.assign({}, mockSettings, { translation_strings: mockTranslationStrings }),
							},
						});
					}
				}

				return Promise.reject(new Error(`Path "${path}" is not mocked in this test`));
			},
			patch: (path: string) => {
				if (path === '/settings') {
					return Promise.resolve({
						data: {
							data: mockSettings,
						},
					});
				}

				return Promise.reject(new Error(`Path "${path}" is not mocked in this test`));
			},
		},
	};
});

let apiGetSpy: SpyInstance;

beforeAll(() => {
	apiGetSpy = vi.spyOn(api, 'get');
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('hydrate action', async () => {
	test('should not fetch anything for public (no logged in user)', async () => {
		const settingsStore = useSettingsStore();
		await settingsStore.hydrate();

		expect(apiGetSpy).not.toHaveBeenCalled();
		expect(settingsStore.settings).toEqual(null);
	});

	test('should not fetch anything for share user', async () => {
		const userStore = useUserStore();
		userStore.currentUser = mockShareUser;

		const settingsStore = useSettingsStore();
		await settingsStore.hydrate();

		expect(apiGetSpy).not.toHaveBeenCalled();
		expect(settingsStore.settings).toEqual(null);
	});

	test('should fetch settings for logged in user', async () => {
		const userStore = useUserStore();
		userStore.currentUser = mockUser;

		const settingsStore = useSettingsStore();
		await settingsStore.hydrate();

		expect(apiGetSpy).toHaveBeenCalledOnce();
		expect(settingsStore.settings).toEqual(mockSettings);
	});
});

describe('dehyrate action', () => {
	test('should reset store', async () => {
		const userStore = useUserStore();
		userStore.currentUser = mockUser;

		const settingsStore = useSettingsStore();
		await settingsStore.hydrate();
		await settingsStore.dehydrate();

		expect(settingsStore.settings).toEqual(null);
	});
});

describe('updateSettings action', async () => {
	let ApiPatchSpy: SpyInstance;
	let NotifySpy: SpyInstance;
	let unexpectedErrorSpy: SpyInstance;

	beforeEach(() => {
		ApiPatchSpy = vi.spyOn(api, 'patch');
		NotifySpy = vi.spyOn(notifyUtil, 'notify');
		unexpectedErrorSpy = vi.spyOn(unexpectedErrorUtil, 'unexpectedError').mockReturnValue();
	});

	test('should notifyOnSuccess', async () => {
		const settingsStore = useSettingsStore();
		await settingsStore.updateSettings({});

		expect(ApiPatchSpy).toHaveBeenCalledOnce();
		expect(NotifySpy).toHaveBeenCalledOnce();
	});

	test('should not notifyOnSuccess', async () => {
		const settingsStore = useSettingsStore();
		await settingsStore.updateSettings({}, false);

		expect(ApiPatchSpy).toHaveBeenCalledOnce();
		expect(NotifySpy).not.toHaveBeenCalled();
	});

	test('should call unexpectedError on catch', async () => {
		// intentional reject to induce error
		ApiPatchSpy.mockImplementation(() => Promise.reject());

		const settingsStore = useSettingsStore();
		await settingsStore.updateSettings({}, false);

		expect(ApiPatchSpy).toHaveBeenCalledOnce();
		expect(NotifySpy).not.toHaveBeenCalled();
		expect(unexpectedErrorSpy).toHaveBeenCalledOnce();
	});
});

describe('fetchRawTranslationStrings action', async () => {
	test('should not update translation_strings value when store is empty', async () => {
		const settingsStore = useSettingsStore();
		await settingsStore.fetchRawTranslationStrings();

		expect(apiGetSpy).toHaveBeenCalledOnce();
		expect(settingsStore.settings).toEqual(null);
		expect(settingsStore.settings?.translation_strings).toEqual(undefined);
	});

	test('should update translation_strings value in existing store', async () => {
		const userStore = useUserStore();
		userStore.currentUser = mockUser;

		const settingsStore = useSettingsStore();
		await settingsStore.hydrate();

		expect(apiGetSpy).toHaveBeenCalledTimes(1);
		expect(settingsStore.settings?.translation_strings).toEqual([]);

		const translationStrings = await settingsStore.fetchRawTranslationStrings();

		expect(apiGetSpy).toHaveBeenCalledTimes(2);
		expect(settingsStore.settings?.translation_strings).toEqual(mockTranslationStrings);
		expect(translationStrings).toEqual(mockTranslationStrings);
	});
});
