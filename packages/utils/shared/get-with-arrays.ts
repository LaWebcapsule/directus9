function getResult(object: Record<string, unknown> | unknown[], key: string): Record<string, unknown> | unknown[] {
	if (Array.isArray(object)) {
		return object
			.map((entry) => (entry as Record<string, unknown>)?.[key])
			.filter((entry) => entry)
			.flat();
	} else {
		return object?.[key] as Record<string, unknown> | unknown[];
	}
}

/**
 * Basically the same as `get` from `lodash`, but will convert nested array values to arrays, so for example:
 *
 * @example
 * ```js
 * const obj = { value: [{ example: 1 }, { example: 2 }]}
 * get(obj, 'value.example');
 * // => [1, 2]
 * ```
 */
export function get(
	object: Record<string, unknown> | unknown[],
	path: string,
	defaultValue?: unknown,
): Record<string, unknown> | unknown[] | unknown {
	let key = path.split('.')[0]!;
	const follow = path.split('.').slice(1);

	if (key.includes(':')) key = key.split(':')[0]!;

	const result = getResult(object, key);

	if (follow.length > 0) {
		return get(result, follow.join('.'), defaultValue);
	}

	return result ?? defaultValue;
}

export function getFlat(
	object: Record<string, unknown> | unknown[],
	path: string,
	defaultValue?: unknown,
): Record<string, unknown> | unknown[] | unknown {
	const result = get(object, path, defaultValue);
	if (Array.isArray(result)) {
		return result.flat(10); // set a hard coded max depth to nasty recursion issues
	}
	return result;
}
