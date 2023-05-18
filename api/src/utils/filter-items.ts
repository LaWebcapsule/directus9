import type { FieldFilter, Query } from '@directus9/types';
import { generateJoi } from '@directus9/utils';

/*
 Note: Filtering is normally done through SQL in run-ast. This function can be used in case an already
 existing array of items has to be filtered using the same filter syntax as used in the ast-to-sql flow
 */

export function filterItems(items: Record<string, any>[], filter: Query['filter']): Record<string, any>[] {
	if (!filter) return items;

	return items.filter((item) => {
		return passesFilter(item, filter);
	});

	function passesFilter(item: Record<string, any>, filter: Query['filter']): boolean {
		if (!filter || Object.keys(filter).length === 0) return true;

		if (Object.keys(filter)[0] === '_and') {
			const subfilter = Object.values(filter)[0] as Query['filter'][];

			return subfilter.every((subFilter) => {
				return passesFilter(item, subFilter);
			});
		} else if (Object.keys(filter)[0] === '_or') {
			const subfilter = Object.values(filter)[0] as Query['filter'][];

			return subfilter.some((subFilter) => {
				return passesFilter(item, subFilter);
			});
		} else {
			const schema = generateJoi(filter as FieldFilter);

			const { error } = schema.validate(item);
			return error === undefined;
		}
	}
}
