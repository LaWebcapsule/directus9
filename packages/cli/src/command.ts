import type { Argv } from 'yargs';
import type { CLIError } from './core/exceptions.js';
import type { StdinFeatures } from './core/extensions/stdin.js';
import type { CommandHelp, GeneralHelp } from './help.js';
import type { IOutput } from './output.js';
import type { Toolbox } from './toolbox.js';

export type Features = {
	sdk?: boolean;
	query?: 'one' | 'many';
	output?: boolean;
	stdin?: StdinFeatures;
	[feature: string]: unknown;
};

export type Settings<P = unknown> = {
	description?: string;
	parameters?: string;
	group?: string;
	synopsis?: string;
	documentation?: string;
	configuration?: string;
	usage?: string;
	features?: Features;
	disableHelp?: boolean;
	hidden?: boolean;
	hints?: string[];
	options?(builder: Argv): Argv<P>;
};

export type Handler<T extends Toolbox = Toolbox, P = unknown, R = void> = (toolbox: T, params: P) => Promise<R>;

export type CommandResult<T> = {
	result?: T;
	help?: GeneralHelp | CommandHelp | undefined;
	error?: CLIError;
	output?: IOutput;
};

export type Command<T extends Toolbox = Toolbox, P = unknown, R = void> = {
	settings?: Settings<P>;
	run: {
		/**
		 * @note Please don't access this field. It's for internal use only and a workaround for Gluegun.
		 */
		$directus: {
			settings: Settings<P>;
		};
		(toolbox: T): R | Promise<CommandResult<R>>;
	};
};
