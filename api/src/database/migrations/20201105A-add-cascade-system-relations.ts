import type { Knex } from 'knex';

const updates = [
	{
		table: 'directus9_fields',
		constraints: [
			{
				column: 'group',
				references: 'directus9_fields.id',
			},
		],
	},
	{
		table: 'directus9_files',
		constraints: [
			{
				column: 'folder',
				references: 'directus9_folders.id',
			},
			{
				column: 'uploaded_by',
				references: 'directus9_users.id',
			},
			{
				column: 'modified_by',
				references: 'directus9_users.id',
			},
		],
	},
	{
		table: 'directus9_folders',
		constraints: [
			{
				column: 'parent',
				references: 'directus9_folders.id',
			},
		],
	},
	{
		table: 'directus9_permissions',
		constraints: [
			{
				column: 'role',
				references: 'directus9_roles.id',
			},
		],
	},
	{
		table: 'directus9_presets',
		constraints: [
			{
				column: 'user',
				references: 'directus9_users.id',
			},
			{
				column: 'role',
				references: 'directus9_roles.id',
			},
		],
	},
	{
		table: 'directus9_revisions',
		constraints: [
			{
				column: 'activity',
				references: 'directus9_activity.id',
			},
			{
				column: 'parent',
				references: 'directus9_revisions.id',
			},
		],
	},
	{
		table: 'directus9_sessions',
		constraints: [
			{
				column: 'user',
				references: 'directus9_users.id',
			},
		],
	},
	{
		table: 'directus9_settings',
		constraints: [
			{
				column: 'project_logo',
				references: 'directus9_files.id',
			},
			{
				column: 'public_foreground',
				references: 'directus9_files.id',
			},
			{
				column: 'public_background',
				references: 'directus9_files.id',
			},
		],
	},
	{
		table: 'directus9_users',
		constraints: [
			{
				column: 'role',
				references: 'directus9_roles.id',
			},
		],
	},
];

/**
 * NOTE:
 * Not all databases allow (or support) recursive onUpdate/onDelete triggers. MS SQL / Oracle flat out deny creating them,
 * Postgres behaves erratic on those triggers, not sure if MySQL / Maria plays nice either.
 */

export async function up(knex: Knex): Promise<void> {
	for (const update of updates) {
		await knex.schema.alterTable(update.table, (table) => {
			for (const constraint of update.constraints) {
				table.dropForeign([constraint.column]);
				table.foreign(constraint.column).references(constraint.references);
			}
		});
	}
}

export async function down(knex: Knex): Promise<void> {
	for (const update of updates) {
		await knex.schema.alterTable(update.table, (table) => {
			for (const constraint of update.constraints) {
				table.dropForeign([constraint.column]);
			}
		});
	}
}
