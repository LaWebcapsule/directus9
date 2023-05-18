import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus9_roles', (table) => {
		table.dropColumn('module_list');
	});

	await knex.schema.alterTable('directus9_settings', (table) => {
		table.json('module_bar');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('directus9_roles', (table) => {
		table.json('module_list');
	});

	await knex.schema.alterTable('directus9_settings', (table) => {
		table.dropColumn('module_bar');
	});
}
