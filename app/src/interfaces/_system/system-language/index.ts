import { defineInterface } from '@wbce-d9/utils';
import InterfaceSystemLanguage from './system-language.vue';

export default defineInterface({
	id: 'system-language',
	name: '$t:language',
	icon: 'translate',
	component: InterfaceSystemLanguage,
	system: true,
	types: ['string'],
	options: [],
});
