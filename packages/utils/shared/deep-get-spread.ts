type Primitives = string | number | boolean;

type PossibleValues = Primitives | ObjectValues | ObjectValues[];

interface ObjectValues {
	[key: string]: PossibleValues | PossibleValues[] | null | undefined;
}

export function deepGetSpread(obj: PossibleValues, key: string) {
	switch (typeof obj) {
		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
			return obj;
	}
	if (Array.isArray(obj)) {
		// we've found a relation
		return [obj];
	}
	const values: PossibleValues[] = [];
	const fieldKeyParts = key.split('.');
	if (fieldKeyParts.length > 0) {
		do {
			const part = fieldKeyParts.shift();
			if (part) {
				const item = obj?.[part];
				if (item !== null && item !== undefined) {
					if (Array.isArray(item)) {
						for (const child of item) {
							const spread = deepGetSpread(child, fieldKeyParts.join('.'));
							if (Array.isArray(spread)) {
								values.push(...spread);
							} else {
							}
						}
					} else if (fieldKeyParts.length > 1) {
						const spread = deepGetSpread(item, fieldKeyParts.join('.'));
						if (Array.isArray(spread)) {
							values.push(...spread);
						} else {
							values.push(spread);
						}
					} else {
						values.push(item);
					}
				}
			}
		} while (fieldKeyParts.length > 0);
	}
	return values;
}
