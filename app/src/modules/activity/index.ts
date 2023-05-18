import { defineModule } from '@directus9/utils';
import ActivityCollection from './routes/collection.vue';
import ActivityItem from './routes/item.vue';

export default defineModule({
	id: 'activity',
	hidden: true,
	name: '$t:activity',
	icon: 'notifications',
	routes: [
		{
			name: 'activity-collection',
			path: '',
			component: ActivityCollection,
			props: true,
			children: [
				{
					name: 'activity-item',
					path: ':primaryKey',
					components: {
						detail: ActivityItem,
					},
				},
			],
		},
	],
});
