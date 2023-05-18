import type { Knex } from 'knex';
import { getDefaultIndexName } from '../../utils/get-default-index-name.js';

const indexName = getDefaultIndexName('foreign', 'directus9_settings', 'storage_default_folder');

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus9_settings', (table) => {
		table
			.uuid('storage_default_folder')
			.references('id')
			.inTable('directus9_folders')
			.withKeyName(indexName)
			.onDelete('SET NULL');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus9_files', (table) => {
		table.dropForeign(['storage_default_folder'], indexName);
		table.dropColumn('storage_default_folder');
	});
}
