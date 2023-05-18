const generateHash = require('../setup-utils');

exports.seed = async function (knex) {
	await knex('tests_flow_data').del();
	await knex('tests_flow_completed').del();

	await knex('directus9_roles').where('id', 'd70c0943-5b55-4c5d-a613-f539a27a57f5').del();

	await knex('directus9_roles').insert([
		{
			id: 'd70c0943-5b55-4c5d-a613-f539a27a57f5',
			name: 'Tests Flow Role',
			admin_access: true,
			app_access: true,
		},
	]);

	await knex('directus9_users').where('id', '3d075128-c073-4f5d-891c-ed2eb2790a1c').del();

	await knex('directus9_users').insert([
		{
			id: '3d075128-c073-4f5d-891c-ed2eb2790a1c',
			email: 'flow@tests.com',
			password: await generateHash.hash('TestsFlowUserPassword'),
			status: 'active',
			role: 'd70c0943-5b55-4c5d-a613-f539a27a57f5',
			token: 'TestsFlowToken',
		},
	]);
};
