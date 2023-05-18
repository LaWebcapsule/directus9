import { describe, expect, vi, test } from 'vitest';
import { getAuthProviders } from '../../src/utils/get-auth-providers.js';

let factoryEnv: { [k: string]: any } = {};

vi.mock('../../src/env', () => ({
	default: new Proxy(
		{},
		{
			get(_target, prop) {
				return factoryEnv[prop as string];
			},
		}
	),
}));

const scenarios = [
	{
		name: 'when no providers configured',
		input: {},
		output: [],
	},
	{
		name: 'when no driver configured',
		input: {
			AUTH_PROVIDERS: 'directus9',
		},
		output: [],
	},

	{
		name: 'when single provider and driver are properly configured',
		input: {
			AUTH_PROVIDERS: 'directus9',
			AUTH_DIRECTUS9_DRIVER: 'openid',
			AUTH_DIRECTUS9_LABEL: 'Directus9',
			AUTH_DIRECTUS9_ICON: 'hare',
		},
		output: [
			{
				name: 'directus9',
				driver: 'openid',
				label: 'Directus9',
				icon: 'hare',
			},
		],
	},

	{
		name: 'when multiple provider and driver are properly configured',
		input: {
			AUTH_PROVIDERS: 'directus9,custom',
			AUTH_DIRECTUS9_DRIVER: 'openid',
			AUTH_DIRECTUS9_LABEL: 'Directus9',
			AUTH_DIRECTUS9_ICON: 'hare',
			AUTH_CUSTOM_DRIVER: 'openid',
			AUTH_CUSTOM_ICON: 'lock',
		},
		output: [
			{
				name: 'directus9',
				driver: 'openid',
				label: 'Directus9',
				icon: 'hare',
			},
			{
				name: 'custom',
				driver: 'openid',
				icon: 'lock',
			},
		],
	},
];

describe('get auth providers', () => {
	for (const scenario of scenarios) {
		test(scenario.name, () => {
			factoryEnv = scenario.input;
			expect(getAuthProviders()).toEqual(scenario.output);
		});
	}
});
