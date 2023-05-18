import { defineInterface } from '@directus9/utils';
import InterfaceGroupRaw from './group-raw.vue';
import PreviewSVG from './preview.svg?raw';

export default defineInterface({
	id: 'group-raw',
	name: '$t:interfaces.group-raw.name',
	description: '$t:interfaces.group-raw.description',
	icon: 'view_in_ar',
	component: InterfaceGroupRaw,
	localTypes: ['group'],
	group: 'group',
	types: ['alias'],
	options: [],
	preview: PreviewSVG,
});
