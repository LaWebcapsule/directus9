import { EXTENSION_LANGUAGES } from '@wbce-d9/constants';
import type { Language, LanguageShort } from '../types.js';

export function isLanguage(language: string): language is Language {
	return (EXTENSION_LANGUAGES as readonly string[]).includes(language);
}

export function languageToShort(language: Language): LanguageShort {
	if (language === 'javascript') {
		return 'js';
	} else {
		return 'ts';
	}
}

export function getLanguageFromPath(path: string): string {
	const fileExtension = path.substring(path.lastIndexOf('.') + 1);

	if (fileExtension === 'js') {
		return 'javascript';
	} else if (fileExtension === 'ts') {
		return 'typescript';
	} else {
		return fileExtension;
	}
}
