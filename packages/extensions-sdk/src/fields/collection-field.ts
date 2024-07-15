export interface CollectionAndFieldOptions {
	prefix: string;
	name: string;
	selectedCollection?: string;
	includeSystem?: boolean;
	includeSingleton?: boolean;
	allowPrimaryKey?: boolean;
	allowNone?: boolean;
}

export default function collectionAndField({
	prefix,
	name,
	selectedCollection = '',
	includeSystem = false,
	includeSingleton = false,
	allowPrimaryKey = false,
	allowNone = false,
}: CollectionAndFieldOptions) {
	const collectionIdentifier = `${prefix}-collection`;
	return [
		{
			field: collectionIdentifier,
			type: 'string',
			name: `${name} Collection`,
			meta: {
				interface: 'system-collection',
				options: {
					includeSystem,
					includeSingleton,
				},
				selectedCollection,
				hasBeenSelected: false,
				width: 'half',
			},
		},
		{
			field: 'x-field',
			type: 'string',
			name: 'X-Axis Field',
			meta: {
				interface: 'system-field',
				options: {
					collectionField: collectionIdentifier,
					allowPrimaryKey,
					allowNone,
				},
				width: 'half',
			},
		},
	];
}
