import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const apiPkgPath = resolve(__dirname, '../../package.json');

const { name, version } = JSON.parse(readFileSync(apiPkgPath, 'utf8')) as {
	name: string;
	version: string;
};

const mainPkgPath = resolve(dirname(apiPkgPath), '../../../../../../package.json');
const mainVersion = existsSync(mainPkgPath) ? JSON.parse(readFileSync(mainPkgPath, 'utf8')).version : null;

export { name, version, mainVersion };
