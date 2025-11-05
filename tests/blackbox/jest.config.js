import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const tsconfig = JSON.parse(readFileSync(join(__dirname, './tsconfig.json'), 'utf-8'));

export default {
	preset: 'ts-jest/presets/default-esm',
	verbose: true,
	globalSetup: './setup/setup.ts',
	globalTeardown: './setup/teardown.ts',
	modulePathIgnorePatterns: ['./setup/utils'],
	testSequencer: './setup/customSequencer.js',
	testEnvironment: './setup/customEnvironment.ts',
	moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
	testTimeout: 15000,
	maxWorkers: 1,
	extensionsToTreatAsEsm: ['.ts'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				isolatedModules: false,
				tsconfig: './tsconfig.json',
			},
		],
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
