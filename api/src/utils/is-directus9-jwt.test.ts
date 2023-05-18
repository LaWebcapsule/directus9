import isDirectus9JWT from '../../src/utils/is-directus9-jwt.js';
import jwt from 'jsonwebtoken';
import { test, expect } from 'vitest';

test('Returns false for non JWT string', () => {
	const result = isDirectus9JWT('test');
	expect(result).toBe(false);
});

test('Returns false for JWTs with text payload', () => {
	const token = jwt.sign('plaintext', 'secret');
	const result = isDirectus9JWT(token);
	expect(result).toBe(false);
});

test(`Returns false if token issuer isn't "directus9"`, () => {
	const token = jwt.sign({ payload: 'content' }, 'secret', { issuer: 'rijk' });
	const result = isDirectus9JWT(token);
	expect(result).toBe(false);
});

test(`Returns true if token is valid JWT and issuer is "directus9"`, () => {
	const token = jwt.sign({ payload: 'content' }, 'secret', { issuer: 'directus9' });
	const result = isDirectus9JWT(token);
	expect(result).toBe(true);
});
