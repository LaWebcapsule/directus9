import { API_EXTENSION_TYPES, APP_EXTENSION_TYPES, HYBRID_EXTENSION_TYPES } from '@wbce-d9/constants';
import type { ExtensionType } from '@wbce-d9/types';
import { isIn } from '@wbce-d9/utils';
import type { Language } from '../../types.js';
import getPackageVersion from '../../utils/get-package-version.js';
import getSdkVersion from '../../utils/get-sdk-version.js';

export default async function getExtensionDevDeps(
	type: ExtensionType | ExtensionType[],
	language: Language | Language[] = []
): Promise<Record<string, string>> {
	const types = Array.isArray(type) ? type : [type];
	const languages = Array.isArray(language) ? language : [language];

	const deps: Record<string, string> = {
		'@wbce-d9/extensions-sdk': getSdkVersion(),
	};

	if (languages.includes('typescript')) {
		if (types.some((type) => isIn(type, [...API_EXTENSION_TYPES, ...HYBRID_EXTENSION_TYPES]))) {
			deps['@types/node'] = `^${await getPackageVersion('@types/node')}`;
		}

		deps['typescript'] = `^${await getPackageVersion('typescript')}`;
	}

	if (types.some((type) => isIn(type, [...APP_EXTENSION_TYPES, ...HYBRID_EXTENSION_TYPES]))) {
		deps['vue'] = `^${await getPackageVersion('vue')}`;
	}

	return deps;
}
