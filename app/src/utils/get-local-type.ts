import { useFieldsStore } from '@/stores/fields';
import { useRelationsStore } from '@/stores/relations';
import { LocalType, Relation } from '@directus9/types';

export function getLocalTypeForField(collection: string, field: string): LocalType | null {
	const fieldsStore = useFieldsStore();
	const relationsStore = useRelationsStore();

	const fieldInfo = fieldsStore.getField(collection, field);
	const relations: Relation[] = relationsStore.getRelationsForField(collection, field);

	if (!fieldInfo) return null;

	if (relations.length === 0) {
		if (fieldInfo.type === 'alias') {
			if (fieldInfo.meta?.special?.includes('group')) {
				return 'group';
			}

			return 'presentation';
		}

		return 'standard';
	}

	if (relations.length === 1) {
		const relation = relations[0];
		if (relation.related_collection === 'directus9_files' && relation.related_collection !== collection) return 'file';
		if (relation.collection === collection && relation.field === field) return 'm2o';
		return 'o2m';
	}

	if (relations.length === 2) {
		if ((fieldInfo.meta?.special || []).includes('translations')) {
			return 'translations';
		}

		if ((fieldInfo.meta?.special || []).includes('m2a')) {
			return 'm2a';
		}

		const relationForCurrent = relations.find((relation: Relation) => {
			return (
				(relation.collection === collection && relation.field === field) ||
				(relation.related_collection === collection && relation.meta?.one_field === field)
			);
		});

		if (relationForCurrent?.collection === collection && relationForCurrent?.field === field) {
			return 'm2o';
		}

		if (relations[0].related_collection === 'directus9_files' || relations[1].related_collection === 'directus9_files') {
			return 'files';
		} else {
			return 'm2m';
		}
	}

	return 'standard';
}
