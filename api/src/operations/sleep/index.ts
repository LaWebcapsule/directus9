import { defineOperationApi } from '@wbce-d9/utils';

type Options = {
	milliseconds: string | number;
};

export default defineOperationApi<Options>({
	id: 'sleep',

	handler: async ({ milliseconds }) => {
		await new Promise((resolve) => setTimeout(resolve, Number(milliseconds)));
	},
});
