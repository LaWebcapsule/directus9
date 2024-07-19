import type { IDirectus, QueryMany, QueryOne, TypeMap } from '@db-studio/sdk';
import type { Command } from './command.js';
import type { IOptions } from './options.js';
import type { IEvents } from './events.js';
import type { IOutput } from './output.js';
import type { IHelp } from './help.js';
import type { IConfiguration, IStaticConfiguration, SystemConfiguration, ProjectConfiguration } from './config.js';

export type Toolbox<T extends TypeMap = TypeMap> = {
	command: Command;
	help: IHelp;
	options: IOptions;
	events: IEvents;
	sdk: IDirectus<T>;
	output: IOutput;
	config: {
		system: IConfiguration<SystemConfiguration>;
		project: IStaticConfiguration<ProjectConfiguration>;
	};
	result?: any;
	query: {
		one: QueryOne<unknown>;
		many: QueryMany<unknown>;
	};
	stdin?: any;
	[extension: string]: any | undefined;
};
