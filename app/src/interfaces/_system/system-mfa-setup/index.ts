import { defineInterface } from '@wbce-d9/utils';
import InterfaceSystemMFASetup from './system-mfa-setup.vue';

export default defineInterface({
	id: 'system-mfa-setup',
	name: 'mfa-setup',
	icon: 'box',
	component: InterfaceSystemMFASetup,
	types: ['text'],
	options: [],
	system: true,
});
