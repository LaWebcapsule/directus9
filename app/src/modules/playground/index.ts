import GraphQL from './routes/graphql.vue';
import { defineModule } from '@db-studio/utils';

export default defineModule({
	id: 'playground',
	name: '$t:playground',
	icon: 'code',
	routes: [
		{
			name: 'graphql',
			path: '/graphql',
			component: GraphQL,
		},
	],
});
