import { defaults } from './utils.js';
import type { Argv } from 'yargs';
import type { IOptions } from '../options.js';
import type { IOutput, IUIComposer, IOutputFormat } from '../output.js';
import { TableOutputFormat } from './output/formats/table.js';
import { UIBuilder } from './output/ui.js';
import { type CLIError, CLIRuntimeError } from './exceptions.js';
import type { CommandHelp, GeneralHelp } from '../help.js';
import { WriteStream } from 'fs';

export type OutputOptions = {
	format: string;
};

export class Output implements IOutput {
	private options: IOptions;
	private formats: {
		table: IOutputFormat;
		[name: string]: IOutputFormat;
	};
	private _text: string[];
	private _help?: GeneralHelp | CommandHelp | undefined;
	private _value?: any;
	private _errors: CLIError[];

	constructor(options: IOptions) {
		this.formats = {
			table: new TableOutputFormat(),
		};
		this._text = [];
		this._errors = [];
		this.options = options;
		this.options.feature('output', (builder: Argv, _, raw) => {
			builder.option('format', {
				description: 'The output format',
				default: 'table',
				choices: [...Object.keys(this.formats)],
			});

			const explicitFormat = raw.format ?? 'table';
			Object.entries(this.formats).forEach(([name, format]) => {
				if (name === explicitFormat) {
					format.registerOptions(builder);
				}
			});

			if (explicitFormat != 'table' && !(explicitFormat in this.formats)) {
				this.formats['table']!.registerOptions(builder);
				throw new CLIRuntimeError(`Unknown output format: ${explicitFormat}`);
			}
		});
	}

	async help(help: GeneralHelp | CommandHelp): Promise<void> {
		this._help = help;
	}

	async text(text: string): Promise<void> {
		this._text.push(text);
	}

	async value<T>(value: T): Promise<void> {
		this._value = value;
	}

	async error(err: CLIError): Promise<void> {
		this._errors.push({
			code: err.code,
			name: err.name,
			message: err.message,
			stack: err.stack,
		});
	}

	async flush(stream: WriteStream): Promise<void> {
		stream.write(
			await this.getFormatter().format(
				{
					value: {
						result: this._value,
						help: this._help,
						errors: this._errors.length > 0 ? this._errors : undefined,
					},
					help: this._help,
					text: this._text,
					errors: this._errors,
				},
				this.getOptions()
			)
		);

		this._help = undefined;
		this._value = undefined;
		this._errors = [];
		this._text = [];
	}

	registerFormat(name: string, format: IOutputFormat): void {
		this.formats[name] = format;
	}

	async compose(builder: (builder: IUIComposer) => Promise<void>): Promise<void> {
		const outputBuilder = new UIBuilder();
		await builder(outputBuilder);
		await this.text(await outputBuilder.get());
	}

	getFormatter(): IOutputFormat {
		const { format } = this.getOptions();
		return this.formats[format] ?? this.formats['table']!;
	}

	getOptions(options?: Partial<OutputOptions>): OutputOptions {
		const opts = this.options.values() as OutputOptions & { [k: string]: any };
		return defaults(options, {
			...opts,
			format: (opts.format as any) ?? 'table',
		}) as OutputOptions;
	}
}
