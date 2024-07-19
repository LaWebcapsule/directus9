#!/usr/bin/env node

import { existsSync } from 'fs';
import { resolve } from 'path';

import { config } from 'dotenv';

config();

const startupOptions = {
	devMode: !!process.env.DIRECTUS_CLI_DEV && existsSync(`${__dirname}/../src`),
	useGlobal: !!process.env.DIRECTUS_CLI_DEV && !!process.env.DIRECTUS_CLI_DEV_USE_GLOBAL,
	useCompiled: !!process.env.DIRECTUS_CLI_DEV && !!process.env.DIRECTUS_CLI_DEV_USE_COMPILED,
};

const entrypoint = resolve('./node_modules/@db-studio/cli/bin/studio.js');
if (__filename !== entrypoint && existsSync(entrypoint) && !startupOptions.useGlobal) {
	require(entrypoint);
	return;
}

async function main(run) {
	const debug = require('debug')('db-studio');
	try {
		const { error, output } = await run(process.argv);
		if (error) {
			debug(error);
		}

		if (output) {
			await output.flush(process.stdout);
			process.stdout.write('\n');
		}

		process.exit(error ? 1 : 0);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		process.exit(1);
	}
}

let run = () => {};

if (!startupOptions.devMode || startupOptions.useCompiled) {
	run = require(`${__dirname}/../dist/index`).default;
} else {
	process.env.DEBUG = `${process.env.DEBUG ?? ''}db-studio-cli`;
	require('ts-node').register({ project: `${__dirname}/../tsconfig.json` });
	run = require(`${__dirname}/../src/index`).default;
}

main(run);
