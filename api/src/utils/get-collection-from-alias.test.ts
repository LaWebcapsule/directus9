import { expect, it } from 'vitest';
import { getCollectionFromAlias } from './get-collection-from-alias.js';
import type { AliasMap } from './get-column-path.js';

it('Returns the correct collection', () => {
	const aliasMap: AliasMap = {
		author: { alias: 'aaaaa', collection: 'directus9_users' },
		'author.role': { alias: 'bbbbb', collection: 'directus9_roles' },
		'author.role.org': { alias: 'ccccc', collection: 'organisation' },
		'author.role.org.admin': { alias: 'ddddd', collection: 'directus9_users' },
	};

	const collection = getCollectionFromAlias('ccccc', aliasMap);
	expect(collection).toBe('organisation');
});

it('Returns undefined if alias does not exist', () => {
	const aliasMap: AliasMap = {};

	const collection = getCollectionFromAlias('abcde', aliasMap);
	expect(collection).toBeUndefined();
});
