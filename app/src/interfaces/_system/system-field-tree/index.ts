import { defineInterface } from '@directus9/utils';
import InterfaceSystemFieldTree from './system-field-tree.vue';

export default defineInterface({
	id: 'system-field-tree',
	name: '$t:field',
	icon: 'box',
	component: InterfaceSystemFieldTree,
	types: ['string'],
	options: [],
	system: true,
});
