import { StateUpdates, State, HelperFunctions } from '../types';
import { set } from 'lodash';
import { useCollectionsStore } from '@/stores/collections';
import { useFieldsStore } from '@/stores/fields';
import { setRelatedOneFieldForCorrespondingField } from './m2m';

export function applyChanges(updates: StateUpdates, state: State, helperFn: HelperFunctions) {
	const { hasChanged } = helperFn;

	if (hasChanged('localType')) {
		removeSchema(updates);
		setTypeToAlias(updates);
		prepareRelation(updates, state);
		setDefaults(updates, state, helperFn);
	}

	if (hasChanged('autoGenerateJunctionRelation')) {
		setDefaults(updates, state, helperFn);
	}

	if (hasChanged('field.field')) {
		updateRelationField(updates);
	}

	if (hasChanged('relations.m2o.related_collection')) {
		preventCircularConstraint(updates, state, helperFn);
	}

	if (hasChanged('relations.o2m.field')) {
		setJunctionFields(updates, state, helperFn);
	}

	if (hasChanged('relations.m2o.field')) {
		setJunctionFields(updates, state, helperFn);
	}

	if (hasChanged('relations.o2m.collection') || hasChanged('relations.m2o.collection')) {
		matchJunctionCollectionName(updates);
	}

	if (hasChanged('fields.corresponding')) {
		setRelatedOneFieldForCorrespondingField(updates);
	}

	if (
		[
			'relations.o2m.collection',
			'relations.o2m.field',
			'relations.m2o.field',
			'relations.m2o.related_collection',
			'relations.o2m.meta.sort_field',
		].some(hasChanged)
	) {
		generateCollections(updates, state, helperFn);
		generateFields(updates, state, helperFn);
	}
}

export function removeSchema(updates: StateUpdates) {
	set(updates, 'field.schema', undefined);
}

export function setTypeToAlias(updates: StateUpdates) {
	set(updates, 'field.type', 'alias');
}

export function prepareRelation(updates: StateUpdates, state: State) {
	if (!updates.relations) updates.relations = {};

	updates.relations.o2m = {
		collection: undefined,
		field: undefined,
		related_collection: state.collection,
		meta: {
			one_field: updates.field?.field ?? state.field.field,
			sort_field: null,
			one_deselect_action: 'nullify',
		},
		schema: {
			on_delete: 'SET NULL',
		},
	};

	updates.relations.m2o = {
		collection: undefined,
		field: undefined,
		related_collection: undefined,
		meta: {
			one_field: null,
			sort_field: null,
			one_deselect_action: 'nullify',
		},
		schema: {
			on_delete: 'SET NULL',
		},
	};
}

export function updateRelationField(updates: StateUpdates) {
	if (!updates.field?.field) return;

	if (!updates.relations?.o2m) updates.relations = { o2m: {} };
	set(updates, 'relations.o2m.meta.one_field', updates.field.field);
}

export function preventCircularConstraint(updates: StateUpdates, _state: State, { getCurrent }: HelperFunctions) {
	if (getCurrent('relations.o2m.collection') === getCurrent('relations.o2m.related_collection')) {
		set(updates, 'relations.o2m.schema.on_delete', 'NO ACTION');
	}

	if (getCurrent('relations.m2o.collection') === getCurrent('relations.m2o.related_collection')) {
		set(updates, 'relations.m2o.schema.on_delete', 'NO ACTION');
	}
}

export function setJunctionFields(updates: StateUpdates, _state: State, { getCurrent }: HelperFunctions) {
	set(updates, 'relations.o2m.meta.junction_field', getCurrent('relations.m2o.field'));
	set(updates, 'relations.m2o.meta.junction_field', getCurrent('relations.o2m.field'));
}

function collectionExists(collection: string) {
	return !!useCollectionsStore().getCollection(collection);
}

function fieldExists(collection: string, field: string) {
	return !!useFieldsStore().getField(collection, field);
}

export function generateCollections(updates: StateUpdates, state: State, { getCurrent }: HelperFunctions) {
	const junctionCollection = getCurrent('relations.o2m.collection');

	if (!junctionCollection || collectionExists(junctionCollection)) {
		set(updates, 'collections.junction', undefined);
	} else {
		set(updates, 'collections.junction', {
			collection: junctionCollection,
			meta: {
				hidden: true,
				icon: 'import_export',
			},
			schema: {
				name: junctionCollection,
			},
			fields: [
				{
					field: 'id',
					type: 'integer',
					schema: {
						has_auto_increment: true,
					},
					meta: {
						hidden: true,
					},
				},
			],
		});
	}
}

function generateFields(updates: StateUpdates, state: State, { getCurrent }: HelperFunctions) {
	const fieldsStore = useFieldsStore();

	const currentPrimaryKeyField = fieldsStore.getPrimaryKeyFieldForCollection(state.collection!);
	const junctionCollection = getCurrent('relations.o2m.collection');
	const junctionCurrent = getCurrent('relations.o2m.field');
	const junctionRelated = getCurrent('relations.m2o.field');
	const relatedCollection = getCurrent('relations.m2o.related_collection');

	const relatedPrimaryKeyField =
		fieldsStore.getPrimaryKeyFieldForCollection(relatedCollection) ?? getCurrent('collections.related.fields[0]');

	const sort = getCurrent('relations.o2m.meta.sort_field');

	if (junctionCollection && junctionCurrent && fieldExists(junctionCollection, junctionCurrent) === false) {
		set(updates, 'fields.junctionCurrent', {
			collection: junctionCollection,
			field: junctionCurrent,
			type: currentPrimaryKeyField?.type ?? 'integer',
			schema: {},
			meta: {
				hidden: true,
			},
		});
	} else {
		set(updates, 'fields.junctionCurrent', undefined);
	}

	if (junctionCollection && junctionRelated && fieldExists(junctionCollection, junctionRelated) === false) {
		set(updates, 'fields.junctionRelated', {
			collection: junctionCollection,
			field: junctionRelated,
			type: relatedPrimaryKeyField?.type ?? 'uuid',
			schema: {},
			meta: {
				hidden: true,
			},
		});
	} else {
		set(updates, 'fields.junctionRelated', undefined);
	}

	if (junctionCollection && sort && fieldExists(junctionCollection, sort) === false) {
		set(updates, 'fields.sort', {
			collection: junctionCollection,
			field: sort,
			type: 'integer',
			schema: {},
			meta: {
				hidden: true,
			},
		});
	} else {
		set(updates, 'fields.sort', undefined);
	}
}

export function setDefaults(updates: StateUpdates, state: State, { getCurrent }: HelperFunctions) {
	if (getCurrent('autoGenerateJunctionRelation') === false) return;

	const fieldsStore = useFieldsStore();

	const currentCollection = state.collection!;

	const currentCollectionPrimaryKeyField =
		fieldsStore.getPrimaryKeyFieldForCollection(currentCollection)?.field ?? 'id';

	const junctionName = getAutomaticJunctionCollectionName(currentCollection);

	set(updates, 'relations.o2m.collection', junctionName);
	set(updates, 'relations.o2m.field', `${currentCollection}_${currentCollectionPrimaryKeyField}`);
	set(updates, 'relations.m2o.collection', junctionName);
	set(updates, 'relations.m2o.related_collection', 'directus_files');

	set(updates, 'relations.m2o.field', 'directus_files_id');
}

export function matchJunctionCollectionName(updates: StateUpdates) {
	if (updates?.relations?.o2m?.collection && updates.relations.o2m.collection !== updates.relations.m2o?.collection) {
		set(updates, 'relations.m2o.collection', updates.relations.o2m.collection);
	}

	if (updates?.relations?.m2o?.collection && updates.relations.m2o.collection !== updates.relations.o2m?.collection) {
		set(updates, 'relations.o2m.collection', updates.relations.m2o.collection);
	}
}

export function getAutomaticJunctionCollectionName(collectionA: string) {
	let index = 0;
	let name = getName(index);

	while (collectionExists(name)) {
		index++;
		name = getName(index);
	}

	return name;

	function getName(index: number) {
		let name = `${collectionA}_files`;

		if (name.startsWith('directus_')) {
			name = 'junction_' + name;
		}

		if (index) return name + '_' + index;
		return name;
	}
}
