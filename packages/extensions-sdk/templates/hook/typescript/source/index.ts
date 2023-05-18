import { defineHook } from '@directus9/extensions-sdk';

export default defineHook(({ filter, action }) => {
	filter('items.create', () => {
		console.log('Creating Item!');
	});

	action('items.create', () => {
		console.log('Item created!');
	});
});
