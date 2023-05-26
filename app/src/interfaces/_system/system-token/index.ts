import { defineInterface } from '@wbce-d9/utils';
import InterfaceSystemToken from './system-token.vue';

export default defineInterface({
	id: 'system-token',
	name: '$t:interfaces.system-token.system-token',
	description: '$t:interfaces.system-token.description',
	icon: 'vpn_key',
	component: InterfaceSystemToken,
	system: true,
	types: ['hash'],
	options: [],
});
