import { VMError } from 'vm2';
import { test, expect } from 'vitest';

import config from './index.js';

test('Rejects when modules are used without modules being allowed', async () => {
	const testCode = `
		const test = require('test');
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_EXEC_ALLOWED_MODULES: '',
			},
		} as any)
	).rejects.toEqual(new VMError("Cannot find module 'test'"));
});

test('Rejects when code contains syntax errors', async () => {
	const testCode = `
		~~
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_EXEC_ALLOWED_MODULES: '',
			},
		} as any)
	).rejects.toEqual(new SyntaxError('Unexpected end of input'));
});

test('Rejects when returned function does something illegal', async () => {
	const testCode = `
		module.exports = function() {
			return a + b;
		};
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_EXEC_ALLOWED_MODULES: '',
			},
		} as any)
	).rejects.toEqual(new ReferenceError('a is not defined'));
});

test("Rejects when code doesn't return valid function", async () => {
	const testCode = `
		module.exports = false;
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_EXEC_ALLOWED_MODULES: '',
			},
		} as any)
	).rejects.toEqual(new TypeError('fn is not a function'));
});

test('Rejects returned function throws errors', async () => {
	const testCode = `
		module.exports = function () {
			throw new Error('test');
		};
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_EXEC_ALLOWED_MODULES: '',
			},
		} as any)
	).rejects.toEqual(new Error('test'));
});

test('Executes function when valid', () => {
	const testCode = `
		module.exports = function (data) {
			return { result: data.input + ' test' };
		};
	`;

	expect(
		config.handler({ code: testCode }, {
			data: {
				input: 'start',
			},
			env: {
				FLOWS_EXEC_ALLOWED_MODULES: '',
			},
		} as any)
	).resolves.toEqual({ result: 'start test' });
});

test('Allows built-in modules that are whitelisted', () => {
	const testCode = `
		const crypto = require('crypto');

		module.exports = async function (data) {
			return {
				result: crypto.createHash('sha256').update('directus9').digest('hex'),
			};
		};
	`;

	expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_EXEC_ALLOWED_MODULES: 'crypto',
			},
		} as any)
	).resolves.toEqual({ result: '943e891bf6042f2db8926493c0f94e45b72cb58a21145fdfa3c23b5c057e4b2d' });
});

test('Allows external modules that are whitelisted', () => {
	const testCode = `
		const bytes = require('bytes');

		module.exports = function (data) {
			return { result: bytes(1000) };
		};
	`;

	expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_EXEC_ALLOWED_MODULES: 'bytes',
			},
		} as any)
	).resolves.toEqual({ result: '1000B' });
});
