import type { Filter, SchemaOverview } from '@wbce-d9/types';
import type { Knex } from 'knex';
import { addWhereClauses } from './apply-query.js';
import { cloneDeep } from 'lodash-es';

export async function formulateCheckClause(knex: Knex, collection: string, filter: Filter, schema: SchemaOverview) {
	/**
	 * Strategy :
	 * With filter, we are able to formulate a where statement but not a check statement.
	 * So we formulate the where statement that we will then place in a check statement.
	 * Also, with filter, right assignment of operator are always values (simple ?) in the final query
	 * With the comparaison syntax of check constraint, we want to be able to have right assignent of field
	 * e.g. : filter = {date_end : {_gt : "$FIELD(date_start)" }} should transform into "?? > ??"
	 * To ensure this :
	 *      - we formulate the where clause
	 *      - we change every simple ? to a double ?? when the "?" is for a binding of form $FIELD(...)
	 */
	const cloneFilter = cloneDeep(filter);
	const queryBuilder = knex.queryBuilder();
	addWhereClauses(knex, schema, queryBuilder, cloneFilter, collection, Object.create(null));
	const sqlQuery = queryBuilder.toSQL();
	let bindIndex = 0;
	const checkBindings: any[] = [];

	const whereClause = sqlQuery.sql.replace(/\?+/g, function (value) {
		const bind = sqlQuery.bindings[bindIndex];
		const fieldConstraint = bind?.toString().match(/^\$FIELD\((.*)\)$/i)?.[1];
		let result;

		if (fieldConstraint !== undefined) {
			result = '??';
			checkBindings.push(fieldConstraint);
		} else {
			result = value;
			checkBindings.push(bind);
		}

		bindIndex++;
		return result;
	});

	const whereString = knex.raw(whereClause, checkBindings).toQuery();
	let checkClause = whereString.match(/where\s+(.+)/i)![1]!;
	checkClause = checkClause.replaceAll("?", "\\?")

	await knex.schema.table(collection, (table) => {
		table.check(checkClause, undefined, 'directus_constraint');
	});
}

export async function applyCollectionCheckConstraint(
	knex: Knex,
	collection: string,
	filter: Filter | null,
	schema: SchemaOverview
): Promise<void> {
	await knex.raw(`ALTER TABLE ?? DROP CONSTRAINT IF EXISTS "directus_constraint"`, [collection]);

	if (!filter || Object.keys(filter).length === 0) {
		return;
	}

	await formulateCheckClause(knex, collection, filter, schema);
}
