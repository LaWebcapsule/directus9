import { Output } from '../output.js';
import type { Toolbox } from '../../toolbox.js';
import { JsonOutputFormat } from '../output/formats/json.js';
import { YamlOutputFormat } from '../output/formats/yaml.js';

export default (toolbox: Toolbox): void => {
	toolbox.output = new Output(toolbox.options);
	toolbox.events.on('output.formats.register', (output) => {
		output.registerFormat('json', new JsonOutputFormat());
		output.registerFormat('yaml', new YamlOutputFormat());
		output.registerFormat('yml', new YamlOutputFormat());
	});
};
