import { defineOperationApp } from '@wbce-d9/extensions-sdk';

export default defineOperationApp({
	id: 'custom',
	name: 'Custom',
	icon: 'box',
	description: 'This is my custom operation!',
	overview: ({ text }) => [
		{
			label: 'Text',
			text: text,
		},
	],
	options: [
		{
			field: 'text',
			name: 'Text',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
			},
		},
	],
});
