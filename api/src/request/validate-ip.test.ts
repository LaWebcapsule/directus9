import { randIp, randUrl } from '@ngneat/falso';
import os from 'node:os';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { getEnv } from '../env.js';
import { validateIP } from './validate-ip.js';

// Mock all external dependencies
vi.mock('../env');
vi.mock('node:os');

// Mock logger at the module level to prevent import issues
vi.mock('../logger.js', () => ({
	default: {
		warn: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		debug: vi.fn(),
	},
}));

let sample: {
	ip: string;
	url: string;
};

beforeEach(() => {
	sample = {
		ip: randIp(),
		url: randUrl(),
	};
});

afterEach(() => {
	vi.resetAllMocks();
});

test(`Does nothing if IP is valid`, async () => {
	vi.mocked(getEnv).mockReturnValue({ IMPORT_IP_DENY_LIST: [] });
	await validateIP(sample.ip, sample.url);
});

test(`Throws error if passed IP is denylisted`, async () => {
	vi.mocked(getEnv).mockReturnValue({ IMPORT_IP_DENY_LIST: [sample.ip] });

	await expect(validateIP(sample.ip, sample.url)).rejects.toThrow(
		`Requested URL "${sample.url}" resolves to a denied IP address`
	);
});

test(`Checks against IPs of local networkInterfaces if IP deny list contains 0.0.0.0`, async () => {
	vi.mocked(getEnv).mockReturnValue({ IMPORT_IP_DENY_LIST: ['0.0.0.0'] });
	vi.mocked(os.networkInterfaces).mockReturnValue({});
	await validateIP(sample.ip, sample.url);
	expect(os.networkInterfaces).toHaveBeenCalledOnce();
});

test(`Throws error if IP address matches resolved localhost IP`, async () => {
	vi.mocked(getEnv).mockReturnValue({ IMPORT_IP_DENY_LIST: ['0.0.0.0'] });

	vi.mocked(os.networkInterfaces).mockReturnValue({
		fa0: undefined,
		lo0: [
			{
				address: '127.0.0.1',
				netmask: '255.0.0.0',
				family: 'IPv4',
				mac: '00:00:00:00:00:00',
				internal: true,
				cidr: '127.0.0.1/8',
			},
		],
		en0: [
			{
				address: sample.ip,
				netmask: '255.0.0.0',
				family: 'IPv4',
				mac: '00:00:00:00:00:00',
				internal: true,
				cidr: '127.0.0.1/8',
			},
		],
	});

	await expect(validateIP(sample.ip, sample.url)).rejects.toThrow(
		`Requested URL "${sample.url}" resolves to a denied IP address`
	);
});

test(`Throws error if IP matches resolved to local loopback devices`, async () => {
	vi.mocked(getEnv).mockReturnValue({ IMPORT_IP_DENY_LIST: ['0.0.0.0'] });

	vi.mocked(os.networkInterfaces).mockReturnValue({
		fa0: undefined,
		lo0: [
			{
				address: '127.0.0.1',
				netmask: '255.0.0.0',
				family: 'IPv4',
				mac: '00:00:00:00:00:00',
				internal: true,
				cidr: '127.0.0.1/8',
			},
		],
	});

	// Test that all loopback addresses are blocked (this is the vulnerability fix)
	await expect(validateIP('127.0.0.1', sample.url)).rejects.toThrow(
		`Requested URL "${sample.url}" resolves to a denied IP address`
	);

	await expect(validateIP('127.8.16.32', sample.url)).rejects.toThrow(
		`Requested URL "${sample.url}" resolves to a denied IP address`
	);

	await expect(validateIP('127.127.127.127', sample.url)).rejects.toThrow(
		`Requested URL "${sample.url}" resolves to a denied IP address`
	);
});

// Additional test to verify the vulnerability is fixed for edge cases
test(`Blocks all loopback addresses when 0.0.0.0 is in deny list`, async () => {
	vi.mocked(getEnv).mockReturnValue({ IMPORT_IP_DENY_LIST: ['0.0.0.0'] });
	vi.mocked(os.networkInterfaces).mockReturnValue({});

	// Test various loopback addresses that could bypass the previous implementation
	const loopbackAddresses = ['127.0.0.1', '127.0.0.2', '127.1.1.1', '127.255.255.255', '127.127.127.127'];

	for (const loopbackIP of loopbackAddresses) {
		await expect(validateIP(loopbackIP, sample.url)).rejects.toThrow(
			`Requested URL "${sample.url}" resolves to a denied IP address`
		);
	}
});

test(`Does not block non-loopback addresses when 0.0.0.0 is in deny list`, async () => {
	vi.mocked(getEnv).mockReturnValue({ IMPORT_IP_DENY_LIST: ['0.0.0.0'] });
	vi.mocked(os.networkInterfaces).mockReturnValue({});

	// These should not be blocked
	const nonLoopbackAddresses = [
		'192.168.1.1',
		'10.0.0.1',
		'8.8.8.8',
		'126.255.255.255', // Just before loopback range
		'128.0.0.1', // Just after loopback range
	];

	for (const nonLoopbackIP of nonLoopbackAddresses) {
		await expect(validateIP(nonLoopbackIP, sample.url)).resolves.not.toThrow();
	}
});
