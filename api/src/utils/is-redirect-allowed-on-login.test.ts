import { vi, expect, test, afterEach } from 'vitest';
import { isRedirectAllowedOnLogin } from './is-redirect-allowed-on-login.js';

afterEach(() => {
	vi.clearAllMocks();
    vi.unstubAllEnvs();
});

test('isRedirectAllowedOnLogin returns true with no redirect', () => {
	const redirect = undefined;
	const provider = 'local';

	expect(isRedirectAllowedOnLogin(redirect, provider)).toBe(true);
});

test('isRedirectAllowedOnLogin returns false with invalid redirect', () => {
	const redirect = 123456;
	const provider = 'local';

	expect(isRedirectAllowedOnLogin(redirect, provider)).toBe(false);
});

test('isRedirectAllowedOnLogin returns true for allowed URL', () => {
	const provider = 'local';

    vi.stubEnv(`AUTH_${provider.toUpperCase()}_REDIRECT_ALLOW_LIST`, 'http://external.example.com,https://external.example.com,http://external.example.com:8055/test');
    vi.stubEnv('PUBLIC_URL', 'http://public.example.com');

	expect(isRedirectAllowedOnLogin('http://public.example.com', provider)).toBe(true);
	expect(isRedirectAllowedOnLogin('http://external.example.com', provider)).toBe(true);
	expect(isRedirectAllowedOnLogin('https://external.example.com', provider)).toBe(true);
	expect(isRedirectAllowedOnLogin('http://external.example.com:8055/test', provider)).toBe(true);
});

test('isRedirectAllowedOnLogin returns false for denied URL', () => {
	const provider = 'local';

    vi.stubEnv(`AUTH_${provider.toUpperCase()}_REDIRECT_ALLOW_LIST`, 'http://external.example.com');
    vi.stubEnv('PUBLIC_URL', 'http://public.example.com');

	expect(isRedirectAllowedOnLogin('https://external.example.com', provider)).toBe(false);
	expect(isRedirectAllowedOnLogin('http://external.example.com:8055', provider)).toBe(false);
	expect(isRedirectAllowedOnLogin('http://external.example.com/test', provider)).toBe(false);
});

test('isRedirectAllowedOnLogin returns true for relative paths', () => {
	const provider = 'local';

    vi.stubEnv(`AUTH_${provider.toUpperCase()}_REDIRECT_ALLOW_LIST`, 'http://external.example.com');
    vi.stubEnv('PUBLIC_URL', 'http://public.example.com');

	expect(isRedirectAllowedOnLogin('/admin/content', provider)).toBe(true);
	expect(isRedirectAllowedOnLogin('../admin/content', provider)).toBe(true);
	expect(isRedirectAllowedOnLogin('./admin/content', provider)).toBe(true);

	expect(isRedirectAllowedOnLogin('http://public.example.com/admin/content', provider)).toBe(true);
});

test('isRedirectAllowedOnLogin returns false if missing protocol', () => {
	const provider = 'local';

    vi.stubEnv(`AUTH_${provider.toUpperCase()}_REDIRECT_ALLOW_LIST`, 'http://external.example.com');
    vi.stubEnv('PUBLIC_URL', 'http://public.example.com');

	expect(isRedirectAllowedOnLogin('//example.com/admin/content', provider)).toBe(false);
	expect(isRedirectAllowedOnLogin('//user@password:example.com/', provider)).toBe(false);
});