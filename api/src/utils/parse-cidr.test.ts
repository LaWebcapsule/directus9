import { describe, expect, test } from 'vitest';

import { parseCIDR, isLoopbackIP } from './parse-cidr.js';

describe('parseCIDR', () => {
	// Test avec une IP qui appartient au subnet
	test('returns true when IP belongs to CIDR subnet', () => {
		const result = parseCIDR('192.168.1.100', '192.168.1.0/24');
		expect(result).toBe(true);
	});

	// Test avec une IP qui n'appartient pas au subnet
	test('returns false when IP does not belong to CIDR subnet', () => {
		const result = parseCIDR('192.168.2.100', '192.168.1.0/24');
		expect(result).toBe(false);
	});

	// Test avec un CIDR plus large (/8)
	test('returns true for IP in larger subnet', () => {
		const result = parseCIDR('10.5.10.15', '10.0.0.0/8');
		expect(result).toBe(true);
	});

	// Test avec une IP exactement à la limite du subnet
	test('returns true for IP at subnet boundary', () => {
		const result = parseCIDR('192.168.1.255', '192.168.1.0/24');
		expect(result).toBe(true);
	});

	// Test avec une IP juste en dehors du subnet
	test('returns false for IP just outside subnet', () => {
		const result = parseCIDR('192.168.2.0', '192.168.1.0/24');
		expect(result).toBe(false);
	});

	// Test avec un CIDR mal formaté (manque le subnet)
	test('returns false for CIDR with missing subnet', () => {
		const result = parseCIDR('192.168.1.1', '192.168.1.1');
		expect(result).toBe(false);
	});

	// Test avec un CIDR avec subnet non numérique
	test('returns false for CIDR with non-numeric subnet', () => {
		const result = parseCIDR('192.168.1.1', '192.168.1.1/abc');
		expect(result).toBe(false);
	});

	// Test avec un subnet invalide (> 32)
	test('returns false for CIDR with invalid subnet mask', () => {
		const result = parseCIDR('192.168.1.1', '192.168.1.1/33');
		expect(result).toBe(false);
	});

	// Test avec une adresse IP mal formatée
	test('returns false for invalid IP format', () => {
		const result = parseCIDR('192.168.1', '192.168.1.0/24');
		expect(result).toBe(false);
	});

	// Test avec une IP de plus de 4 segments
	test('returns false for IP with more than 4 segments', () => {
		const result = parseCIDR('192.168.1.1.1', '192.168.1.0/24');
		expect(result).toBe(false);
	});

	// Test avec un subnet négatif
	test('returns false for CIDR with negative subnet mask', () => {
		const result = parseCIDR('192.168.1.1', '192.168.1.1/-1');
		expect(result).toBe(false);
	});

	// Test avec des segments IP invalides (> 255)
	test('returns false for IP with invalid segments', () => {
		const result = parseCIDR('192.168.1.256', '192.168.1.0/24');
		expect(result).toBe(false);
	});
});

describe('isLoopbackIP', () => {
	// Test des adresses de loopback valides
	test('returns true for 127.0.0.1', () => {
		expect(isLoopbackIP('127.0.0.1')).toBe(true);
	});

	test('returns true for 127.0.0.2', () => {
		expect(isLoopbackIP('127.0.0.2')).toBe(true);
	});

	test('returns true for 127.8.16.32', () => {
		expect(isLoopbackIP('127.8.16.32')).toBe(true);
	});

	test('returns true for 127.127.127.127', () => {
		expect(isLoopbackIP('127.127.127.127')).toBe(true);
	});

	// Test des adresses non-loopback
	test('returns false for 192.168.1.1', () => {
		expect(isLoopbackIP('192.168.1.1')).toBe(false);
	});

	test('returns false for 10.0.0.1', () => {
		expect(isLoopbackIP('10.0.0.1')).toBe(false);
	});

	test('returns false for 126.255.255.255', () => {
		expect(isLoopbackIP('126.255.255.255')).toBe(false);
	});

	test('returns false for 128.0.0.1', () => {
		expect(isLoopbackIP('128.0.0.1')).toBe(false);
	});
});
