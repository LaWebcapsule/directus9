import { defineInterface } from '@directus9/utils';
import InterfaceSystemModules from './system-modules.vue';

export default defineInterface({
	id: 'system-modules',
	name: '$t:module_bar',
	icon: 'arrow_drop_down_circle',
	component: InterfaceSystemModules,
	types: ['json'],
	options: [],
	system: true,
});
