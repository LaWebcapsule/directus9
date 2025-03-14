import { defineOperationApi } from '@wbce-d9/utils';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ivm = require('isolated-vm');

type ExecutionOptions = {
	code: string;
};

export default defineOperationApi<ExecutionOptions>({
	id: 'execute_script',
	handler: async ({ code }, { data, env, logger }) => {
		// Fetching execution limits and environment variables
		const memoryLimit = env['FLOWS_SCRIPT_MAX_MEMORY'];
		const executionTimeout = env['FLOWS_SCRIPT_EXEC_TIMEOUT'];
		const environmentVariables = data['$env'] ?? {};

		// Creating an isolate with the specified memory limit
		const isolate = new ivm.Isolate({ memoryLimit });
		const context = isolate.createContextSync();
		const jail = context.global;

		jail.setSync('global', jail.derefInto());

		jail.setSync('process', { env: environmentVariables }, { copy: true });
		jail.setSync('module', { exports: null }, { copy: true });

		// Adding a secure logger for the isolate
		const createLoggerCallback = (logFn: (msg: any) => void) =>
			new ivm.Callback((...args: any[]) => logFn(args.length === 1 ? args[0] : args), { sync: true });

		jail.setSync(
			'console',
			{
				log: createLoggerCallback(() => logger.info),
				info: createLoggerCallback(() => logger.info),
				warn: createLoggerCallback(() => logger.warn),
				error: createLoggerCallback(() => logger.error),
				debug: createLoggerCallback(() => logger.debug),
				trace: createLoggerCallback(() => logger.trace),
			},
			{ copy: true }
		);

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
