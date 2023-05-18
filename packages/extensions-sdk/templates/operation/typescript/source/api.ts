import { defineOperationApi } from '@directus9/extensions-sdk';

type Options = {
	text: string;
};

export default defineOperationApi<Options>({
	id: 'custom',
	handler: ({ text }) => {
		console.log(text);
	},
});
