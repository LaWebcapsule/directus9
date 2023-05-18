import { defineDisplay } from '@directus9/utils';
import DisplayColor from './color.vue';

export default defineDisplay({
	id: 'color',
	name: '$t:displays.color.color',
	description: '$t:displays.color.description',
	types: ['string'],
	icon: 'flag',
	component: DisplayColor,
	options: [
		{
			field: 'defaultColor',
			name: '$t:displays.color.default_color',
			type: 'string',
			meta: {
				interface: 'select-color',
				width: 'half',
			},
			schema: {
				default_value: '#B0BEC5',
			},
		},
	],
});
