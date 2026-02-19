import type { Request } from 'express';
import { getParam } from './get-param.js';
import { describe, test, expect } from 'vitest';

describe('getParam', () => {
	test('returns string value from params', () => {
		const req = { params: { pk: 'abc-123' } } as unknown as Request;
		expect(getParam(req, 'pk')).toBe('abc-123');
	});

	test('returns first element when param is an array', () => {
		const req = { params: { pk: ['abc-123', 'def-456'] } } as unknown as Request;
		expect(getParam(req, 'pk')).toBe('abc-123');
	});

	test('returns empty string when param is undefined', () => {
		const req = { params: {} } as unknown as Request;
		expect(getParam(req, 'pk')).toBe(undefined);
	});
});
