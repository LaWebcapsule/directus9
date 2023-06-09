import type { Filter } from '@wbce-d9/types';
import { defineOperationApi, validatePayload } from '@wbce-d9/utils';

type Options = {
	filter: Filter;
};

export default defineOperationApi<Options>({
	id: 'condition',

	handler: ({ filter }, { data }) => {
		const errors = validatePayload(filter, data, { requireAll: true });

		if (errors.length > 0) {
			throw errors;
		} else {
			return null;
		}
	},
});
