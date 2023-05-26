import type { Accountability } from '@wbce-d9/types';
import { defineOperationApi, optionToString, toArray } from '@wbce-d9/utils';
import { NotificationsService } from '../../services/notifications.js';
import { getAccountabilityForRole } from '../../utils/get-accountability-for-role.js';

type Options = {
	recipient: string;
	subject: string;
	message?: unknown | null;
	permissions: string; // $public, $trigger, $full, or UUID of a role
};

export default defineOperationApi<Options>({
	id: 'notification',

	handler: async ({ recipient, subject, message, permissions }, { accountability, database, getSchema }) => {
		const schema = await getSchema({ database });
		let customAccountability: Accountability | null;

		if (!permissions || permissions === '$trigger') {
			customAccountability = accountability;
		} else if (permissions === '$full') {
			customAccountability = null;
		} else if (permissions === '$public') {
			customAccountability = await getAccountabilityForRole(null, { database, schema, accountability });
		} else {
			customAccountability = await getAccountabilityForRole(permissions, { database, schema, accountability });
		}

		const notificationsService = new NotificationsService({
			schema: await getSchema({ database }),
			accountability: customAccountability,
			knex: database,
		});

		const messageString = message ? optionToString(message) : null;

		const payload = toArray(recipient).map((userId) => {
			return {
				recipient: userId,
				sender: customAccountability?.user ?? null,
				subject,
				message: messageString,
			};
		});

		const result = await notificationsService.createMany(payload);

		return result;
	},
});
