import { defineOperationApi, optionToString } from '@wbce-d9/utils';
import logger from '../../logger.js';

type Options = {
	message: unknown;
};

export default defineOperationApi<Options>({
	id: 'log',

	handler: ({ message }) => {
		logger.info(optionToString(message));
	},
});
