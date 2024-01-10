export function getEndpoint(collection: string): string {
	if (collection == 'directus_collections') {
		return `/items/${collection}`;
	}

	if (collection.startsWith('directus_')) {
		return `/${collection.substring(9)}`;
	}

	return `/items/${collection}`;
}
