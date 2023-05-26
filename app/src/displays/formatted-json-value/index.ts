import { defineDisplay } from '@wbce-d9/utils';
import DisplayJsonValue from './formatted-json-value.vue';
import { render } from 'micromustache';
import { toArray } from '@wbce-d9/utils';

export default defineDisplay({
	id: 'formatted-json-value',
	name: '$t:displays.formatted-json-value.formatted-json-value',
	description: '$t:displays.formatted-json-value.description',
	types: ['json', 'geometry'],
	icon: 'settings_ethernet',
	component: DisplayJsonValue,
	handler: (value, options) => {
		return toArray(value)
			.map((val) => (options.format ? render(val, options.format) : val))
			.join(', ');
	},
	options: [
		{
			field: 'format',
			name: '$t:display_template',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: '{{ field }}',
				},
			},
		},
	],
});
