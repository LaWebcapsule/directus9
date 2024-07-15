import stripAnsi from 'strip-ansi';

import { Argv } from 'yargs';
import { FormatData, IOutputFormat } from '../../../output';
import { FullTerminalWidth, UIBuilder } from '../ui';
import { CLIError } from '../../exceptions';

export type TableOutputFormatOptions = {
	ansi: boolean;
	table: string | 'minimal' | 'compact' | 'markdown';
	stacktrace: boolean;
};

export class TableOutputFormat implements IOutputFormat<TableOutputFormatOptions> {
	registerOptions(options: Argv): Argv<TableOutputFormatOptions> {
		return options
			.option('ansi', {
				type: 'boolean',
				default: true,
				description: 'Whether or not to output ansi codes',
			})
			.option('stacktrace', {
				type: 'boolean',
				default: process.env.DEBUG ? true : false,
				description: 'Display extended information on error',
			})
			.option('table', {
				type: 'string',
				choices: ['minimal', 'compact', 'markdown'],
				default: 'compact',
				description: 'The table layout to use when displaying data',
			});
	}

	async text(text: string, options: TableOutputFormatOptions): Promise<string> {
		if (!options.ansi) {
			text = stripAnsi(text);
		}
		return text;
	}

	async error(error: CLIError, options: TableOutputFormatOptions): Promise<string> {
		const builder = new UIBuilder(2, FullTerminalWidth);
		await builder.error(error, {
			stacktrace: options.stacktrace,
		});

		return await this.text(await builder.get(), options);
	}

	async format(data: FormatData, options: TableOutputFormatOptions): Promise<string> {
		const output = await Promise.all([
			...data.text.map((line) => this.text(line, options)),
			...data.errors.map((error) => this.error(error, options)),
		]);

		// values not displayed on human interface
		return output.join('\n');
	}
}
