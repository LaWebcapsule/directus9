import type { JsonValue } from '@db-studio/types';

export default function tryParseJson(str: string): JsonValue | undefined {
	try {
		return JSON.parse(str);
	} catch {
		return undefined;
	}
}
