import { Action } from '@wbce-d9/constants';
import express from 'express';
import type { RequestHandler } from 'express';
import Joi from 'joi';
import { ForbiddenException, InvalidPayloadException } from '../exceptions/index.js';
import { respond } from '../middleware/respond.js';
import useCollection from '../middleware/use-collection.js';
import { validateBatch } from '../middleware/validate-batch.js';
import { ActivityService } from '../services/activity.js';
import { MetaService } from '../services/meta.js';
import { getParam } from '../utils/get-param.js';
import { getIPFromReq } from '../utils/get-ip-from-req.js';

const router: express.Router = express.Router();

router.use(useCollection('directus_activity'));

const readHandler: RequestHandler = async (req, res, next) => {
	const service = new ActivityService({
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
	} else if (req.body?.keys) {
		result = await service.readMany(req.body.keys, req.sanitizedQuery);
	} else {
		result = await service.readByQuery(req.sanitizedQuery);
	}

	const meta = await metaService.getMetaForQuery('directus_activity', req.sanitizedQuery);

	res.locals['payload'] = {
		data: result,
		meta,
	};

	return next();
};

router.search('/', validateBatch('read'), readHandler, respond);
router.get('/', readHandler, respond);

router.get(
	'/:pk',
	async (req, res, next) => {
		const service = new ActivityService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const record = await service.readOne(getParam(req, 'pk')!, req.sanitizedQuery);

		res.locals['payload'] = {
			data: record || null,
		};

		return next();
	},
	respond
);

const createCommentSchema = Joi.object({
	comment: Joi.string().required(),
	collection: Joi.string().required(),
	item: [Joi.number().required(), Joi.string().required()],
});

router.post(
	'/comment',
	async (req, res, next) => {
		const service = new ActivityService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const { error } = createCommentSchema.validate(req.body);

		if (error) {
			throw new InvalidPayloadException(error.message);
		}

		const primaryKey = await service.createOne({
			...req.body,
			action: Action.COMMENT,
			user: req.accountability?.user,
			ip: getIPFromReq(req),
			user_agent: req.get('user-agent'),
			origin: req.get('origin'),
		});

		try {
			const record = await service.readOne(primaryKey, req.sanitizedQuery);

			res.locals['payload'] = {
				data: record || null,
			};
		} catch (error: any) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		return next();
	},
	respond
);

const updateCommentSchema = Joi.object({
	comment: Joi.string().required(),
});

router.patch(
	'/comment/:pk',
	async (req, res, next) => {
		const service = new ActivityService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const { error } = updateCommentSchema.validate(req.body);

		if (error) {
			throw new InvalidPayloadException(error.message);
		}

		const primaryKey = await service.updateOne(getParam(req, 'pk')!, req.body);

		try {
			const record = await service.readOne(primaryKey, req.sanitizedQuery);

			res.locals['payload'] = {
				data: record || null,
			};
		} catch (error: any) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		return next();
	},
	respond
);

router.delete(
	'/comment/:pk',
	async (req, _res, next) => {
		const service = new ActivityService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const adminService = new ActivityService({
			schema: req.schema,
		});

		const item = await adminService.readOne(getParam(req, 'pk')!, { fields: ['action'] });

		if (!item || item['action'] !== Action.COMMENT) {
			throw new ForbiddenException();
		}

		await service.deleteOne(getParam(req, 'pk')!);

		return next();
	},
	respond
);

export default router;
