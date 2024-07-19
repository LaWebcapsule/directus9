import type { Toolbox } from '../../toolbox.js';
import { Options } from '../options.js';

export default (toolbox: Toolbox): void => {
	toolbox.options = new Options(toolbox.events, [...process.argv].splice(2));
};
