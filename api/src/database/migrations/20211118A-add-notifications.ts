import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('directus9_notifications', (table) => {
		table.increments();
		table.timestamp('timestamp').notNullable();
		table.string('status').defaultTo('inbox');
		table.uuid('recipient').notNullable().references('id').inTable('directus9_users').onDelete('CASCADE');
		table.uuid('sender').notNullable().references('id').inTable('directus9_users');
		table.string('subject').notNullable();
		table.text('message');
		table.string('collection', 64);
		table.string('item');
	});

	await knex.schema.alterTable('directus9_users', (table) => {
		table.boolean('email_notifications').defaultTo(true);
	});

	await knex('directus9_users').update({ email_notifications: true });
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('directus9_notifications');

	await knex.schema.alterTable('directus9_users', (table) => {
		table.dropColumn('email_notifications');
	});
}
