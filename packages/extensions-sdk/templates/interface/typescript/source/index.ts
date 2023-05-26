import { defineInterface } from '@wbce-d9/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'custom',
	name: 'Custom',
	icon: 'box',
	description: 'This is my custom interface!',
	component: InterfaceComponent,
	options: null,
	types: ['string'],
});
