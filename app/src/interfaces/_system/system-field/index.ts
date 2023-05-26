import { defineInterface } from '@wbce-d9/utils';
import InterfaceSystemField from './system-field.vue';

export default defineInterface({
	id: 'system-field',
	name: '$t:field',
	icon: 'box',
	component: InterfaceSystemField,
	types: ['string'],
	options: [],
	system: true,
});
