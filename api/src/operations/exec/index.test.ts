import { test, expect } from 'vitest';
import config from './index.js';

test('Rejects when code contains syntax errors', async () => {
	const testCode = `
		~~
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 10000,
			},
		} as any)
	).rejects.toThrow('Unexpected end of input [<isolated-vm>:3:2]');
});

test('Rejects when code does something illegal', async () => {
	const testCode = `
		module.exports = function() {
			return a + b;
		};
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 10000,
			},
		} as any)
	).rejects.toThrow('a is not defined');
});

test("Rejects when code doesn't return valid function", async () => {
	const testCode = `
		module.exports = false;
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 10000,
			},
		} as any)
	).rejects.toThrow('module.exports is not a function');
});

test('Rejects when returned function throws errors', async () => {
	const testCode = `
		module.exports = function () {
			throw new Error('test');
		};
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 10000,
			},
		} as any)
	).rejects.toThrow('test');
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
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 10000,
			},
		} as any)
	).resolves.toEqual({ result: 'start test' });
});
