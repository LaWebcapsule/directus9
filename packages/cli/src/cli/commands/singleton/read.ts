import { command } from '../../../core/command';

export default command(
	{
		group: 'singletons',
		parameters: '<collection>',
		description: 'Reads data from singleton collection',
		usage: `
			\`\`\`
			$ $0 items read singleton <collection>
			\`\`\`
		`,
		documentation: `
			Reads an existing item by it's primary key.
		`,
		features: {
			sdk: true,
			query: 'one',
		},
		hints: ['single', 'singleton', 'read single', 'get single', 'get singleton'],
		options: function (builder) {
			return builder.positional('collection', {
				type: 'string',
				description: "The collection's name",
				demandOption: true,
			});
		},
	},
	async function ({ output, query, sdk }, params) {
		const item = await sdk.singleton(params.collection).read(query.one);
		await output.compose(async (ui) => {
			await ui.wrap((ui) => ui.header(params.collection), 1);
			await ui.json(item);
		});
		return item;
	}
);
