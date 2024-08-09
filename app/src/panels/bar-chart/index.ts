import { definePanel, useCollection } from '@db-studio/extensions-sdk';
import type { Field, DeepPartial } from '@db-studio/types';
import PanelComponent from './panel-bar-chart.vue';
import { computed } from 'vue';
import { useFieldsStore } from '@/stores/fields';
import { getLocalTypeForField } from '@/utils/get-local-type';

interface DropdownOption {
	value: string;
	text: string;
	disabled?: boolean;
	type?: string;
}

interface AggregateFieldOptions {
	field: string;
	name: string;
	moreChoices?: DropdownOption[];
}

function aggregateField({ field, name, moreChoices = [] }: AggregateFieldOptions): DeepPartial<Field> {
	return {
		field,
		type: 'string',
		name,
		meta: {
			width: 'full',
			interface: 'select-dropdown',
			options: {
				choices: [
					{
						text: '$t:count',
						value: 'count',
					},
					{
						text: '$t:count_distinct',
						value: 'countDistinct',
					},
					{
						text: '$t:avg',
						value: 'avg',
					},
					{
						text: '$t:avg_distinct',
						value: 'avgDistinct',
					},
					{
						text: '$t:sum',
						value: 'sum',
					},
					{
						text: '$t:sum_distinct',
						value: 'sumDistinct',
					},
					{
						text: '$t:min',
						value: 'min',
					},
					{
						text: '$t:max',
						value: 'max',
					},
					...moreChoices,
				],
			},
		},
	};
}

export default definePanel({
	id: 'ushmm.bar-chart',
	name: 'Bar Charts',
	icon: 'box',
	description: 'Create a panel that shows a Bar Chart',
	component: PanelComponent,
	query(options) {
		const required = ['collection', 'category', 'values'];
		if (required.some((field) => !Object.keys(options).includes(field))) {
			return;
		}
		let { collection, category, values, aggregate } = options;
		const fields = useFieldsStore();
		// test if values is a relational field
		const valueField = fields.getField(collection, values);
		// const valueType = getLocalTypeForField(collection, values);
		// if (valueType && ['o2m', 'm2m'].includes(valueType)) {
		// 	values = `${valueField?.collection}.`;
		// }
		return {
			collection: collection,
			query: {
				group: [category],
				aggregate: { [aggregate ?? 'avg']: [values] },
				limit: -1,
			},
		};
	},
	options: ({ options }) => {
		const aggregateRequiresNumber = computed(() => {
			if (options?.['aggregate']) {
				if (['avg', 'avgDistinct', 'sum', 'sumDistinct', 'min', 'max'].includes(options['aggregate'])) {
					return true;
				}
			}
			return false;
		});
		const valueFields = computed(() => {
			if (options?.['collection']) {
				const { fields } = useCollection(options['collection']);
				const choices = fields.value
					.map<DropdownOption | null>((field) => {
						if (field !== null && field !== undefined) {
							const type = getLocalTypeForField(field.collection, field.field);
							if (type !== null && !['alias', 'group', 'presentation', 'm2o', 'm2a'].includes(type)) {
								return { value: field.field, text: field.name, type: field.type };
							}
						}
						return null;
					})
					.filter((value) => value !== null);
				if (aggregateRequiresNumber.value) {
					choices.filter((option) => {
						return option?.type && ['integer', 'bigInteger', 'float', 'decimal'].includes(option.type);
					});
				}
				return choices;
			}
			return [];
		});
		return [
			{
				field: 'collection',
				type: 'string',
				name: 'Collection',
				meta: {
					interface: 'system-collection',
					required: true,
					options: {
						includeSystem: true,
					},
					width: 'full',
				},
			},
			{
				field: 'category',
				name: 'Category Field',
				type: 'string',
				meta: {
					interface: 'system-field',
					required: true,
					width: 'half',
					options: {
						collectionField: 'collection',
						allowPrimaryKey: true,
						placeholder: '$t:primary_key',
					},
				},
			},
			{
				field: 'values',
				name: 'Value Field',
				type: 'string',
				meta: {
					interface: 'select-dropdown',
					required: true,
					width: 'half',
					options: {
						placeholder: '$t:primary_key',
						choices: valueFields.value,
					},
				},
			},
			{
				schema: {
					default_value: 'avg',
				},
				...aggregateField({ field: 'aggregate', name: 'Aggregate Function' }),
			},
		];
	},
	minWidth: 12,
	minHeight: 8,
});
