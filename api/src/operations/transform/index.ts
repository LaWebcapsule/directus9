import { defineOperationApi, optionToObject } from '@wbce-d9/utils';

type Options = {
	json: string | Record<string, any>;
};

export default defineOperationApi<Options>({
	id: 'transform',

	handler: ({ json }) => {
		return optionToObject(json);
	},
});
