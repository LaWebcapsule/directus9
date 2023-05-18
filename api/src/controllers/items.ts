import express from 'express';
import { ForbiddenException, RouteNotFoundException } from '../exceptions/index.js';
import collectionExists from '../middleware/collection-exists.js';
import { respond } from '../middleware/respond.js';
import { validateBatch } from '../middleware/validate-batch.js';
import { ItemsService } from '../services/items.js';
import { MetaService } from '../services/meta.js';
import type { PrimaryKey } from '../types/index.js';
import asyncHandler from '../utils/async-handler.js';
import { sanitizeQuery } from '../utils/sanitize-query.js';

const router = express.Router();

router.post(
	'/:collection',
	collectionExists,
	asyncHandler(async (req, res, next) => {
		if (req.params['collection']!.startsWith('directus_')) throw new ForbiddenException();

		if (req.singleton) {
			throw new RouteNotFoundException(req.path);
		}

		const service = new ItemsService(req.collection, {
			accountability: req.accountability,
			schema: req.schema,
		});

		const savedKeys: PrimaryKey[] = [];

		if (Array.isArray(req.body)) {
			const keys = await service.createMany(req.body);
			savedKeys.push(...keys);
		} else {
			const key = await service.createOne(req.body);
			savedKeys.push(key);
		}

		try {
			if (Array.isArray(req.body)) {
				const result = await service.readMany(savedKeys, req.sanitizedQuery);
				res.locals['payload'] = { data: result || null };
			} else {
				const result = await service.readOne(savedKeys[0]!, req.sanitizedQuery);
				res.locals['payload'] = { data: result || null };
			}
		} catch (error: any) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond
);

const readHandler = asyncHandler(async (req, res, next) => {
	if (req.params['collection']!.startsWith('directus_')) throw new ForbiddenException();

	const service = new ItemsService(req.collection, {
		accountability: req.accountability,
		schema: req.schema,
	});

	const metaService = new MetaService({
		accountability: req.accountability,
		schema: req.schema,
	});

	let result;

	if (req.singleton) {
		result = await service.readSingleton(req.sanitizedQuery);
	} else if (req.body.keys) {
		result = await service.readMany(req.body.keys, req.sanitizedQuery);
	} else {
		result = await service.readByQuery(req.sanitizedQuery);
	}

	const meta = await metaService.getMetaForQuery(req.collection, req.sanitizedQuery);

	res.locals['payload'] = {
		meta: meta,
		data: result,
	};

	return next();
});

router.search('/:collection', collectionExists, validateBatch('read'), readHandler, respond);
router.get('/:collection', collectionExists, readHandler, respond);

router.get(
	'/:collection/:pk',
	collectionExists,
	asyncHandler(async (req, res, next) => {
		if (req.params['collection']!.startsWith('directus_')) throw new ForbiddenException();

		const service = new ItemsService(req.collection, {
			accountability: req.accountability,
			schema: req.schema,
		});

		const result = await service.readOne(req.params['pk']!, req.sanitizedQuery);

		res.locals['payload'] = {
			data: result || null,
		};

		return next();
	}),
	respond
);

router.patch(
	'/:collection',
	collectionExists,
	validateBatch('update'),
	asyncHandler(async (req, res, next) => {
		if (req.params['collection']!.startsWith('directus_')) throw new ForbiddenException();

		const service = new ItemsService(req.collection, {
			accountability: req.accountability,
			schema: req.schema,
		});

		if (req.singleton === true) {
			await service.upsertSingleton(req.body);
			const item = await service.readSingleton(req.sanitizedQuery);

			res.locals['payload'] = { data: item || null };
			return next();
		}

		let keys: PrimaryKey[] = [];

		if (Array.isArray(req.body)) {
			keys = await service.updateBatch(req.body);
		} else if (req.body.keys) {
			keys = await service.updateMany(req.body.keys, req.body.data);
		} else {
			const sanitizedQuery = sanitizeQuery(req.body.query, req.accountability);
			keys = await service.updateByQuery(sanitizedQuery, req.body.data);
		}

		try {
			const result = await service.readMany(keys, req.sanitizedQuery);
			res.locals['payload'] = { data: result };
		} catch (error: any) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond
);

router.patch(
	'/:collection/:pk',
	collectionExists,
	asyncHandler(async (req, res, next) => {
		if (req.params['collection']!.startsWith('directus_')) throw new ForbiddenException();

		if (req.singleton) {
			throw new RouteNotFoundException(req.path);
		}

		const service = new ItemsService(req.collection, {
			accountability: req.accountability,
			schema: req.schema,
		});

		const updatedPrimaryKey = await service.updateOne(req.params['pk']!, req.body);

		try {
			const result = await service.readOne(updatedPrimaryKey, req.sanitizedQuery);
			res.locals['payload'] = { data: result || null };
		} catch (error: any) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond
);

router.delete(
	'/:collection',
	collectionExists,
	validateBatch('delete'),
	asyncHandler(async (req, _res, next) => {
		if (req.params['collection']!.startsWith('directus_')) throw new ForbiddenException();

		const service = new ItemsService(req.collection, {
			accountability: req.accountability,
			schema: req.schema,
		});

		if (Array.isArray(req.body)) {
			await service.deleteMany(req.body);
		} else if (req.body.keys) {
			await service.deleteMany(req.body.keys);
		} else {
			const sanitizedQuery = sanitizeQuery(req.body.query, req.accountability);
			await service.deleteByQuery(sanitizedQuery);
		}

		return next();
	}),
	respond
);

router.delete(
	'/:collection/:pk',
	collectionExists,
	asyncHandler(async (req, _res, next) => {
		if (req.params['collection']!.startsWith('directus_')) throw new ForbiddenException();

		const service = new ItemsService(req.collection, {
			accountability: req.accountability,
			schema: req.schema,
		});

		await service.deleteOne(req.params['pk']!);
		return next();
	}),
	respond
);

export default router;
