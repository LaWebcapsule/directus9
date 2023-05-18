import type { Accountability, PrimaryKey } from '@directus9/types';
import { defineOperationApi, optionToObject, toArray } from '@directus9/utils';
import { ItemsService } from '../../services/items.js';
import type { Item } from '../../types/index.js';
import { getAccountabilityForRole } from '../../utils/get-accountability-for-role.js';

type Options = {
	collection: string;
	payload?: Record<string, any> | string | null;
	emitEvents: boolean;
	permissions: string; // $public, $trigger, $full, or UUID of a role
};

export default defineOperationApi<Options>({
	id: 'item-create',

	handler: async ({ collection, payload, emitEvents, permissions }, { accountability, database, getSchema }) => {
		const schema = await getSchema({ database });
		let customAccountability: Accountability | null;

		if (!permissions || permissions === '$trigger') {
			customAccountability = accountability;
		} else if (permissions === '$full') {
			customAccountability = await getAccountabilityForRole('system', { database, schema, accountability });
		} else if (permissions === '$public') {
			customAccountability = await getAccountabilityForRole(null, { database, schema, accountability });
		} else {
			customAccountability = await getAccountabilityForRole(permissions, { database, schema, accountability });
		}

		const itemsService = new ItemsService(collection, {
			schema: await getSchema({ database }),
			accountability: customAccountability,
			knex: database,
		});

		const payloadObject: Partial<Item> | Partial<Item>[] | null = optionToObject(payload) ?? null;

		let result: PrimaryKey[] | null;

		if (!payloadObject) {
			result = null;
		} else {
			result = await itemsService.createMany(toArray(payloadObject), { emitEvents: !!emitEvents });
		}

		return result;
	},
});
