import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus9_fields', (table) => {
		table.dropForeign(['collection']);
	});

	await knex.schema.alterTable('directus9_activity', (table) => {
		table.dropForeign(['collection']);
	});

	await knex.schema.alterTable('directus9_permissions', (table) => {
		table.dropForeign(['collection']);
	});

	await knex.schema.alterTable('directus9_presets', (table) => {
		table.dropForeign(['collection']);
	});

	await knex.schema.alterTable('directus9_relations', (table) => {
		table.dropForeign(['one_collection']);
		table.dropForeign(['many_collection']);
	});

	await knex.schema.alterTable('directus9_revisions', (table) => {
		table.dropForeign(['collection']);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus9_fields', (table) => {
		table.foreign('collection').references('directus9_collections.collection');
	});

	await knex.schema.alterTable('directus9_activity', (table) => {
		table.foreign('collection').references('directus9_collections.collection');
	});

	await knex.schema.alterTable('directus9_permissions', (table) => {
		table.foreign('collection').references('directus9_collections.collection');
	});

	await knex.schema.alterTable('directus9_presets', (table) => {
		table.foreign('collection').references('directus9_collections.collection');
	});

	await knex.schema.alterTable('directus9_relations', (table) => {
		table.foreign('one_collection').references('directus9_collections.collection');
		table.foreign('many_collection').references('directus9_collections.collection');
	});

	await knex.schema.alterTable('directus9_revisions', (table) => {
		table.foreign('collection').references('directus9_collections.collection');
	});
}
