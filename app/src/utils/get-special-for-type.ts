import { Type } from '@wbce-d9/types';

export function getSpecialForType(type: Type): string[] | null {
	switch (type) {
		case 'json':
		case 'csv':
		case 'boolean':
			return ['cast-' + type];
		case 'uuid':
		case 'hash':
		case 'geometry':
			return [type];
		default:
			return null;
	}
}
