import { expect, test } from 'vitest';
import isUrlAllowed from './is-url-allowed.js';

test('isUrlAllowed should authorize matching domain', () => {
	const testUrl = 'http://example.com';
	const urlAllowList = ['http:/example.com/'];

	expect(isUrlAllowed(testUrl, urlAllowList)).toBe(true);
});

test('isUrlAllowed should authorize matching path', () => {
	const testUrl = 'http://example.com/test';
	const urlAllowList = ['http://example.com/test'];

	expect(isUrlAllowed(testUrl, urlAllowList)).toBe(true);
});

test('isUrlAllowed should not authorize different paths', () => {
	const testUrl = 'http://example.com/test';
	const urlAllowList = ['http://example.com/test1', 'http://example.com/test2', 'http://example.com/'];

	expect(isUrlAllowed(testUrl, urlAllowList)).toBe(false);
});

test('isUrlAllowed should not authorize different domains', () => {
	const testUrl = 'http://test.com/';
	const urlAllowList = ['http://example.com/', 'http://test.chat'];

	expect(isUrlAllowed(testUrl, urlAllowList)).toBe(false);
});

test('isUrlAllowed should not authorize varying protocols', () => {
	const testUrl = 'http://example.com/';
	const urlAllowList = ['ftp://example.com/', 'https://example.com/'];

	expect(isUrlAllowed(testUrl, urlAllowList)).toBe(false);
});
