import type { Toolbox } from '../../toolbox.js';
import { Events } from '../events.js';

export default (toolbox: Toolbox): void => {
	toolbox.events = new Events();
};
