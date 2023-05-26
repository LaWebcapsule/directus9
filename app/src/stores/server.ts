import api, { replaceQueue } from '@/api';
import { AUTH_SSO_DRIVERS, DEFAULT_AUTH_DRIVER, DEFAULT_AUTH_PROVIDER } from '@/constants';
import { i18n } from '@/lang';
import { setLanguage } from '@/lang/set-language';
import formatTitle from '@wbce-d9/format-title';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, reactive, unref } from 'vue';
import { useUserStore } from '@/stores/user';

type HydrateOptions = {
	/**
	 * Allow setting current admin language only when default language gets updated.
	 */
	isLanguageUpdated?: boolean;
};

export type Info = {
	project: null | {
		project_name: string | null;
		project_descriptor: string | null;
		project_logo: string | null;
		project_color: string | null;
		default_language: string | null;
		public_foreground: string | null;
		public_background: string | null;
		public_note: string | null;
		custom_css: string | null;
	};
	directus?: {
		version: string;
	};
	node?: {
		version: string;
		uptime: number;
	};
	os?: {
		type: string;
		version: string;
		uptime: number;
		totalmem: number;
	};
	rateLimit?:
		| false
		| {
				points: number;
				duration: number;
		  };
	flows?: {
		execAllowedModules: string[];
	};
};

export type Auth = {
	providers: { driver: string; name: string }[];
	disableDefault: boolean;
};

export const useServerStore = defineStore('serverStore', () => {
	const info = reactive<Info>({
		project: null,
		directus: undefined,
		node: undefined,
		os: undefined,
		rateLimit: undefined,
		flows: undefined,
	});

	const auth = reactive<Auth>({
		providers: [],
		disableDefault: false,
	});

	const providerOptions = computed(() => {
		const options = auth.providers
			.filter((provider) => !AUTH_SSO_DRIVERS.includes(provider.driver))
			.map((provider) => ({ text: formatTitle(provider.name), value: provider.name, driver: provider.driver }));

		if (!auth.disableDefault) {
			options.unshift({
				text: i18n.global.t('default_provider'),
				value: DEFAULT_AUTH_PROVIDER,
				driver: DEFAULT_AUTH_DRIVER,
			});
		}

		return options;
	});

	const hydrate = async (options?: HydrateOptions) => {
		const [serverInfoResponse, authResponse] = await Promise.all([
			api.get(`/server/info`, { params: { limit: -1 } }),
			api.get('/auth'),
		]);

		info.project = serverInfoResponse.data.data?.project;
		info.directus = serverInfoResponse.data.data?.directus;
		info.node = serverInfoResponse.data.data?.node;
		info.os = serverInfoResponse.data.data?.os;
		info.flows = serverInfoResponse.data.data?.flows;

		auth.providers = authResponse.data.data;
		auth.disableDefault = authResponse.data.disableDefault;

		const { currentUser } = useUserStore();

		// set language as default locale before login
		// or reset language for admin when they update it without having their own language set
		if (!currentUser || (options?.isLanguageUpdated === true && !currentUser?.language)) {
			await setLanguage(unref(info)?.project?.default_language ?? 'en-US');
		}

		if (serverInfoResponse.data.data?.rateLimit !== undefined) {
			if (serverInfoResponse.data.data?.rateLimit === false) {
				await replaceQueue();
			} else {
				const { duration, points } = serverInfoResponse.data.data.rateLimit;
				await replaceQueue({ intervalCap: points - 10, interval: duration * 1000, carryoverConcurrencyCount: true });
			}
		}
	};

	const dehydrate = () => {
		info.project = null;
		info.directus = undefined;
		info.node = undefined;
		info.os = undefined;

		auth.providers = [];
		auth.disableDefault = false;
	};

	return { info, auth, providerOptions, hydrate, dehydrate };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useServerStore, import.meta.hot));
}
