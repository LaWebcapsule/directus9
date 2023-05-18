import type { Knex } from 'knex';
import { getHelpers } from '../helpers/index.js';

export async function up(knex: Knex): Promise<void> {
	const helper = getHelpers(knex).schema;

	await helper.changeToType('directus_notifications', 'timestamp', 'timestamp', {
		nullable: true,
		default: knex.fn.now(),
	});
}

export async function down(knex: Knex): Promise<void> {
	const helper = getHelpers(knex).schema;

	await helper.changeToType('directus_notifications', 'timestamp', 'timestamp', {
		nullable: false,
	});
}
