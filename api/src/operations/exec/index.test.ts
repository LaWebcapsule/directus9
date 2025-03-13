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

test('Executes synchronous function when valid', () => {
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

test('Executes asynchronous function when valid', async () => {
	const testCode = `
		module.exports = async function (data) {
			return { result: data.input + ' test' };
		};
	`;

	await expect(
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

test('Rejects when CommonJS modules are attempted to be used', async () => {
	const testCode = `
		const path = require('node:path');
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 10000,
			},
		} as any)
	).rejects.toThrow('require is not defined');
});

test('Rejects when ESM modules are used within the isolate', async () => {
	const testCode = `
		import { URL } from 'node:url';
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 10000,
			},
		} as any)
	).rejects.toThrow('Cannot use import statement outside a module [<isolated-vm>:2:3]');
});

test('Rejects when the operation exceeds the allowed execution time', async () => {
	const infiniteLoop = `
		while (true) {}
	`;

	const asyncInfiniteLoop = `
		module.exports = async function (data) {
			while (true) {}
		}
	`;

	await expect(
		config.handler({ code: infiniteLoop }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 250, // 250ms timeout
			},
		} as any)
	).rejects.toThrow('Script execution timed out.');

	await expect(
		config.handler({ code: asyncInfiniteLoop }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 250,
			},
		} as any)
	).rejects.toThrow('Script execution timed out.');
});

test('Rejects when memory usage exceeds the allowed limit in the isolate', async () => {
	const testCode = `
		const largeArray = [];
		const chunkSize = 1024 * 1024 * 2;
		while (true) {
			const buffer = new Uint8Array(chunkSize);
			for (let i = 0; i < chunkSize; i += 4096) {
				buffer[i] = 1; // Filling array to force memory usage
			}
			largeArray.push(buffer);
		}
	`;

	await expect(
		config.handler({ code: testCode }, {
			data: {},
			env: {
				FLOWS_SCRIPT_MAX_MEMORY: 8,
				FLOWS_SCRIPT_EXEC_TIMEOUT: 10000,
			},
		} as any)
	).rejects.toThrow('Array buffer allocation failed');
});
