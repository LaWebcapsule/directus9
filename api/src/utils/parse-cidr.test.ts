import { describe, expect, test } from 'vitest';

import { parseCIDR } from './parse-cidr.js';

// Cas de test pour la fonction parseCIDR
describe('parseCIDR', () => {
	// Test valide avec un CIDR correct
	test('returns true for a valid CIDR notation', () => {
		const result = parseCIDR('192.168.1.1/24');
		expect(result).toBe(true);
	});

	// Test valide avec un CIDR dans une autre plage d'adresses
	test('returns true for another valid CIDR notation', () => {
		const result = parseCIDR('10.0.0.0/8');
		expect(result).toBe(true);
	});

	// Test invalide : CIDR avec format erroné (manque le subnet)
	test('returns false for CIDR with missing subnet', () => {
		const result = parseCIDR('192.168.1.1');
		expect(result).toBe(false);
	});

	// Test invalide : CIDR avec subnet non numérique
	test('returns false for CIDR with non-numeric subnet', () => {
		const result = parseCIDR('192.168.1.1/abc');
		expect(result).toBe(false);
	});

	// Test invalide : CIDR avec un subnet invalide (ex. 33, plus grand que 32)
	test('returns false for CIDR with invalid subnet mask', () => {
		const result = parseCIDR('192.168.1.1/33');
		expect(result).toBe(false);
	});

	// Test invalide : CIDR avec adresse IP mal formatée
	test('returns false for CIDR with invalid IP format', () => {
		const result = parseCIDR('192.168.1/24');
		expect(result).toBe(false);
	});

	// Test invalide : CIDR avec un IP de plus de 4 segments
	test('returns false for CIDR with IP having more than 4 segments', () => {
		const result = parseCIDR('192.168.1.1.1/24');
		expect(result).toBe(false);
	});

	// Test valide avec un CIDR spécifique pour vérifier les calculs
	test('returns true for a CIDR belonging to the correct subnet', () => {
		const result = parseCIDR('192.168.1.128/25');
		expect(result).toBe(true);
	});

	// Test valide avec CIDR particulier pour une autre plage
	test('returns true for CIDR of 172.16.5.1/16', () => {
		const result = parseCIDR('172.16.5.1/16');
		expect(result).toBe(true);
	});

	// Test invalide : CIDR mal formé avec subnet trop petit (ex. -1)
	test('returns false for CIDR with a subnet mask of -1', () => {
		const result = parseCIDR('192.168.1.1/-1');
		expect(result).toBe(false);
	});
});
