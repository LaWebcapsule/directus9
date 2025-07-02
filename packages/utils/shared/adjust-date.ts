import {
	addYears,
	subWeeks,
	subYears,
	addWeeks,
	subMonths,
	addMonths,
	subDays,
	addDays,
	subHours,
	addHours,
	subMinutes,
	addMinutes,
	subSeconds,
	addSeconds,
	addMilliseconds,
	subMilliseconds,
} from 'date-fns';
import { clone } from 'lodash-es';

/**
 * Adjust a given date by a given change in duration. This adjustment value uses the same syntax
 * and logic as Vercel's `ms`.
 */
export function adjustDate(date: Date, adjustment: string): Date | undefined {
	date = clone(date);

	const subtract = adjustment.startsWith('-');

	if (subtract || adjustment.startsWith('+')) {
		adjustment = adjustment.substring(1);
	}

	const parseResult = parseAdjustmentString(adjustment);

	if (!parseResult) {
		return;
	}

	const { amount, type } = parseResult;

	switch (type) {
		case 'years':
		case 'year':
		case 'yrs':
		case 'yr':
		case 'y':
			return subtract ? subYears(date, amount) : addYears(date, amount);
		case 'months':
		case 'month':
		case 'mth':
		case 'mo':
			return subtract ? subMonths(date, amount) : addMonths(date, amount);
		case 'weeks':
		case 'week':
		case 'w':
			return subtract ? subWeeks(date, amount) : addWeeks(date, amount);
		case 'days':
		case 'day':
		case 'd':
			return subtract ? subDays(date, amount) : addDays(date, amount);
		case 'hours':
		case 'hour':
		case 'hrs':
		case 'hr':
		case 'h':
			return subtract ? subHours(date, amount) : addHours(date, amount);
		case 'minutes':
		case 'minute':
		case 'mins':
		case 'min':
		case 'm':
			return subtract ? subMinutes(date, amount) : addMinutes(date, amount);
		case 'seconds':
		case 'second':
		case 'secs':
		case 'sec':
		case 's':
			return subtract ? subSeconds(date, amount) : addSeconds(date, amount);
		case 'milliseconds':
		case 'millisecond':
		case 'msecs':
		case 'msec':
		case 'ms':
			return subtract ? subMilliseconds(date, amount) : addMilliseconds(date, amount);
		default:
			return undefined;
	}
}

/**
 * Parse adjustment string compatible with Vercel's `ms` package syntax.
 * Supports formats like "1d", "2 hours", "1.5 weeks", etc.
 * The parsing logic is lifted from `ms` but implemented without vulnerable regex patterns.
 *
 * @param adjustment - The adjustment string to parse (e.g., "1d", "2 hours")
 * @returns Object with amount and type, or null if parsing fails
 */
function parseAdjustmentString(adjustment: string): { amount: number; type: string } | null {
	// Clean the input string
	adjustment = adjustment.trim().toLowerCase();

	if (!adjustment) return null;

	// List of valid units (like in the original regex)
	const validUnits = [
		'milliseconds',
		'millisecond',
		'msecs',
		'msec',
		'ms',
		'seconds',
		'second',
		'secs',
		'sec',
		's',
		'minutes',
		'minute',
		'mins',
		'min',
		'm',
		'hours',
		'hour',
		'hrs',
		'hr',
		'h',
		'days',
		'day',
		'd',
		'weeks',
		'week',
		'w',
		'months',
		'month',
		'mth',
		'mo',
		'years',
		'year',
		'yrs',
		'yr',
		'y',
	];

	// Find the end of the number part
	let numEndIndex = 0;
	let hasNumber = false;

	for (let i = 0; i < adjustment.length; i++) {
		const char = adjustment[i]!;

		if ((char >= '0' && char <= '9') || char === '.' || (i === 0 && char === '-')) {
			numEndIndex = i + 1;
			hasNumber = true;
		} else {
			// Hit a non-numeric character (space or letter)
			break;
		}
	}

	// Must have a valid number at the start
	if (!hasNumber || numEndIndex === 0) {
		return null;
	}

	const numberPart = adjustment.substring(0, numEndIndex);
	// Pour le unitPart, on prend tout après le nombre et on trim pour enlever les espaces
	const unitPart = adjustment.substring(numEndIndex).trim();

	// Parse the numeric value - must be valid
	const amount = parseFloat(numberPart);
	if (isNaN(amount) || !isFinite(amount)) return null;

	// Si pas d'unité, on utilise 'days' comme unité par défaut
	if (!unitPart) {
		return { amount, type: 'days' };
	}

	// Vérifie que l'unité est valide
	if (!validUnits.includes(unitPart)) {
		return null; // Retourne null si l'unité n'est pas reconnue (comme la regex)
	}

	return { amount, type: unitPart };
}
