export function getEndpoint(collection: string, bypass_collections_calls = false): string {
	// ** bypass_collections_calls: [issues-33] we allow directus_collections to be read as items for m2m collection visualization
	if (bypass_collections_calls && collection == 'directus_collections') {
		return `/items/${collection}`;
	}

	if (collection.startsWith('directus_')) {
		return `/${collection.substring(9)}`;
	}

	return `/items/${collection}`;
}
