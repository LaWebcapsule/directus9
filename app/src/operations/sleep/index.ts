import { defineOperationApp } from '@wbce-d9/utils';

export default defineOperationApp({
	id: 'sleep',
	icon: 'schedule',
	name: '$t:operations.sleep.name',
	description: '$t:operations.sleep.description',
	overview: ({ milliseconds }) => [
		{
			label: '$t:operations.sleep.milliseconds',
			text: milliseconds,
		},
	],
	options: [
		{
			field: 'milliseconds',
			name: '$t:operations.sleep.milliseconds',
			type: 'integer',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					min: 0,
					type: 'integer',
					placeholder: '1000',
				},
			},
		},
	],
});
