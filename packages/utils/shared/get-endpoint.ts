export function getEndpoint(collection: string): string {
	// [issues-33] we allow directus_collections to be read as items for m2m collection visualization
	if (collection == 'directus_collections') {
		return `/items/${collection}`;
	}

	if (collection.startsWith('directus_')) {
		return `/${collection.substring(9)}`;
	}

	return `/items/${collection}`;
}
