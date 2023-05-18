exports.seed = async function (knex) {
	if (process.env.TEST_LOCAL) {
		await knex('directus9_collections').del();
		await knex('directus9_relations').del();
		await knex('directus9_roles').del();
		await knex('directus9_users').del();
	}
};
