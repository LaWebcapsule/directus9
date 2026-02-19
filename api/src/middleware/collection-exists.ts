/**
 * Check if requested collection exists, and save it to req.collection
 */

import type { RequestHandler } from 'express';
import { systemCollectionRows } from '../database/system-data/collections/index.js';
import { ForbiddenException } from '../exceptions/index.js';
import { getParam } from '../utils/get-param.js';

const collectionExists: RequestHandler = async (req, _res, next) => {
	const collection = getParam(req, 'collection');

	if (!collection) return next();

	if (collection in req.schema.collections === false) {
		throw new ForbiddenException();
	}

	req.collection = collection!;

	if (req.collection.startsWith('directus_')) {
		const systemRow = systemCollectionRows.find((collection) => {
			return collection?.collection === req.collection;
		});

		req.singleton = !!systemRow?.singleton;
	} else {
		req.singleton = req.schema.collections[req.collection]?.singleton ?? false;
	}

	return next();
};

export default collectionExists;
