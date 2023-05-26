import type { Relation } from '@wbce-d9/types';

export function getRelationType(getRelationOptions: {
	relation?: Relation | null;
	collection: string | null;
	field: string;
}): 'm2o' | 'o2m' | 'a2o' | null {
	const { relation, collection, field } = getRelationOptions;

	if (!relation) return null;

	if (
		relation.collection === collection &&
		relation.field === field &&
		relation.meta?.one_collection_field &&
		relation.meta?.one_allowed_collections
	) {
		return 'a2o';
	}

	if (relation.collection === collection && relation.field === field) {
		return 'm2o';
	}

	if (relation.related_collection === collection && relation.meta?.one_field === field) {
		return 'o2m';
	}

	return null;
}
