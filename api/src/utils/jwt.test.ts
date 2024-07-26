import jwt from 'jsonwebtoken';
import { expect, test, vi } from 'vitest';
import {
	InvalidTokenException,
	ServiceUnavailableException,
	TokenExpiredException,
} from '../../src/exceptions/index.js';
import type { DirectusTokenPayload } from '../../src/types/index.js';
import { verifyAccessJWT, verifyJWT } from '../../src/utils/jwt.js';

const payload: DirectusTokenPayload = { role: null, app_access: false, admin_access: false, refresh_token: 'test' };
const secret = 'test-secret';
const options = { issuer: 'directus' };

test('Returns the payload of a correctly signed token', () => {
	const token = jwt.sign(payload, secret, options);
	const result = verifyJWT(token, secret);

	expect(result['admin_access']).toEqual(payload.admin_access);
	expect(result['app_access']).toEqual(payload.app_access);
	expect(result['role']).toEqual(payload.role);
	expect(result['iss']).toBe('directus');
	expect(result['iat']).toBeTypeOf('number');
});

test('Throws TokenExpiredException when token used has expired', () => {
	const token = jwt.sign({ ...payload, exp: new Date().getTime() / 1000 - 500 }, secret, options);
	expect(() => verifyJWT(token, secret)).toThrow(TokenExpiredException);
});

const InvalidTokenCases = {
	'wrong issuer': jwt.sign(payload, secret, { issuer: 'wrong' }),
	'wrong secret': jwt.sign(payload, 'wrong-secret', options),
	'string payload': jwt.sign('illegal payload', secret),
};

Object.entries(InvalidTokenCases).forEach(([title, token]) =>
	test(`Throws InvalidTokenError - ${title}`, () => {
		expect(() => verifyJWT(token, secret)).toThrow(InvalidTokenException);
	})
);

test(`Throws ServiceUnavailableException for unexpected error from jsonwebtoken`, () => {
	const mock = vi.spyOn(jwt, 'verify').mockImplementation(() => {
		throw new Error();
	});

	const token = jwt.sign(payload, secret, options);
	expect(() => verifyJWT(token, secret)).toThrow(ServiceUnavailableException);
	mock.mockRestore();
});

const RequiredEntries: Array<keyof DirectusTokenPayload> = ['role', 'app_access', 'admin_access', 'refresh_token'];

RequiredEntries.forEach((entry) => {
	test(`Throws InvalidTokenException if ${entry} not defined`, () => {
		const { [entry]: _entryName, ...rest } = payload;
		const token = jwt.sign(rest, secret, options);
		expect(() => verifyAccessJWT(token, secret)).toThrow(InvalidTokenException);
	});
});

test('Returns the payload of an access token', () => {
	const payload = { id: 1, role: 1, app_access: true, admin_access: true, refresh_token: 'test' };
	const token = jwt.sign(payload, secret, options);
	const result = verifyAccessJWT(token, secret);

	expect(result).toEqual({
		id: 1,
		role: 1,
		app_access: true,
		admin_access: true,
		share: undefined,
		share_scope: undefined,
		refresh_token: 'test',
	});
});
