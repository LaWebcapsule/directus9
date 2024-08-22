import { defineInterface } from '@db-studio/utils';
import RawDate from './raw-date.vue';

export default defineInterface({
	id: 'raw-date',
	name: '$t:interfaces.raw-date.raw-date',
	description: '$t:interfaces.raw-date.description',
	icon: 'today',
	component: RawDate,
	types: ['dateTime', 'date', 'time', 'timestamp'],
	group: 'selection',
	options: () => {
		return [
			{
				field: 'validationRegex',
				name: '$t:interfaces.raw-date.regex',
				type: 'string',
				meta: {
					width: 'full',
					interface: 'input',
				},
			},
			{
				field: 'validationMessage',
				name: '$t:interfaces.raw-date.message',
				type: 'string',
				meta: {
					width: 'full',
					interface: 'input',
				},
			},
			{
				field: 'inputType',
				name: '$t:interfaces.raw-date.input-type',
				type: 'string',
				meta: {
					width: 'full',
					interface: 'select-dropdown',
					options: {
						placeholder: '$t:interfaces.raw-date.input-type-placeholder',
						choices: [
							{
								text: 'Date',
								value: 'date',
							},
							{
								text: 'Date and Time',
								value: 'datetime-local',
							},
							{
								text: 'Month and Year',
								value: 'month',
							},
							{
								text: 'Timestamp',
								value: 'number',
							},
							{
								text: 'Time',
								value: 'time',
							},
							{
								text: 'Week and Year',
								value: 'week',
							},
							{
								text: 'Raw Text',
								value: 'text',
							},
						],
					},
				},
			},
		];
	},
	recommendedDisplays: ['datetime'],
});
