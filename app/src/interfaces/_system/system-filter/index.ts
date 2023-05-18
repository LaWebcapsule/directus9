import { defineInterface } from '@directus9/utils';
import InterfaceSystemFilter from './system-filter.vue';

export default defineInterface({
	id: 'system-filter',
	name: '$t:interfaces.filter.name',
	icon: 'search',
	component: InterfaceSystemFilter,
	types: ['json'],
	options: [],
	system: true,
});
