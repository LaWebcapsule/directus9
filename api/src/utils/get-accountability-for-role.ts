import type { Accountability, SchemaOverview } from '@wbce-d9/types';
import type { Knex } from 'knex';
import { InvalidConfigException } from '../exceptions/index.js';
import { getPermissions } from './get-permissions.js';

export async function getAccountabilityForRole(
	role: null | string,
	context: {
		accountability: null | Accountability;
		schema: SchemaOverview;
		database: Knex;
	}
): Promise<Accountability> {
	let generatedAccountability: Accountability | null = context.accountability;

	if (role === null) {
		generatedAccountability = {
			role: null,
			user: null,
			admin: false,
			app: false,
		};

		generatedAccountability.permissions = await getPermissions(generatedAccountability, context.schema);
	} else if (role === 'system') {
		generatedAccountability = {
			user: null,
			role: null,
			admin: true,
			app: true,
			permissions: [],
		};
	} else {
		const roleInfo = await context.database
			.select(['app_access', 'admin_access'])
			.from('directus_roles')
			.where({ id: role })
			.first();

		if (!roleInfo) {
			throw new InvalidConfigException(`Configured role "${role}" isn't a valid role ID or doesn't exist.`);
		}

		generatedAccountability = {
			role,
			user: null,
			admin: roleInfo.admin_access === 1 || roleInfo.admin_access === '1' || roleInfo.admin_access === true,
			app: roleInfo.app_access === 1 || roleInfo.app_access === '1' || roleInfo.app_access === true,
		};

		generatedAccountability.permissions = await getPermissions(generatedAccountability, context.schema);
	}

	return generatedAccountability;
}
