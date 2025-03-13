import { defineOperationApi } from '@wbce-d9/utils';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ivm = require('isolated-vm');

type ExecutionOptions = {
	code: string;
};

export default defineOperationApi<ExecutionOptions>({
	id: 'execute_script',
	handler: async ({ code }, { data, env }) => {
		// Fetching execution limits and environment variables
		const memoryLimit = env['FLOWS_SCRIPT_MAX_MEMORY'];
		const executionTimeout = env['FLOWS_SCRIPT_EXEC_TIMEOUT'];
		const environmentVariables = data['$env'] ?? {};

		// Creating an isolate with the specified memory limit
		const isolate = new ivm.Isolate({ memoryLimit });
		const context = isolate.createContextSync();
		const jail = context.global;

		jail.setSync('global', jail.derefInto());

		jail.setSync('log', function(...args: any[]) {
			console.log(...args);
		});

		jail.setSync('process', { env: environmentVariables }, { copy: true });
		jail.setSync('module', { exports: null }, { copy: true });

		// Executing the code within the isolate
		await context.eval(code, { timeout: executionTimeout });

		const dataCopy = new ivm.ExternalCopy({ data });

		const resultReference = await context.evalClosure(`return module.exports($0.data)`, [dataCopy.copyInto()], {
			result: { reference: true, promise: true },
			timeout: executionTimeout,
		});

		const finalResult = await resultReference.copy();

		// Cleanup memory
		resultReference.release();
		dataCopy.release();
		context.release();
		isolate.dispose();

		return finalResult;
	},
});
