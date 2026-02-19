import type { Request } from 'express';

/**
 * Extracts a route parameter as a string from req.params.
 * In Express 5, params can be string | string[] (wildcards return arrays).
 * This helper safely handles both cases for named parameters.
 */
export function getParam(req: Request, name: string): string | undefined {
	const value = req.params[name];
	return Array.isArray(value) ? value[0]! : value;
}
