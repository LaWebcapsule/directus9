import type { GluegunToolbox } from 'gluegun';
import type { Toolbox } from '../../toolbox.js';
import { Help } from '../help.js';

export default (toolbox: Toolbox): void => {
	const tb = toolbox as any as GluegunToolbox;
	toolbox.help = new Help(tb.runtime?.brand ?? 'directus', {
		output: toolbox.output,
		runtime: toolbox['runtime'], // TODO: dig into this typing to determine if this should actually be treated as an indexed type
		//events: toolbox.events,
		options: toolbox.options,
	});
};
