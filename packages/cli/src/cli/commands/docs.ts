import open from 'open';
import { tty } from '../../core/utils.js';
import { command } from '../../core/command.js';

export default command(
	{
		group: 'helpers',
		description: 'Opens the documentation website',
		usage: `
			\`\`\`
			$ $0 docs
			\`\`\`
		`,
		documentation: `
			Opens the documentation website.
		`,
	},
	async function () {
		const url = 'https://docs.directus.io';
		if (tty) {
			await open(url, { wait: true });
		}
		return {
			url,
		};
	}
);
