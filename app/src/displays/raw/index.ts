import { defineDisplay } from '@directus9/utils';
import { TYPES, LOCAL_TYPES } from '@directus9/constants';

export default defineDisplay({
	id: 'raw',
	name: '$t:displays.raw.raw',
	icon: 'code',
	component: ({ value }) => (typeof value === 'string' ? value : JSON.stringify(value)),
	options: [],
	types: TYPES,
	localTypes: LOCAL_TYPES,
});
