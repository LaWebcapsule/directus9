import { TYPES } from '@wbce-d9/constants';
import type { Field, Type } from '@wbce-d9/types';
import { Router } from 'express';
import Joi from 'joi';
import { ALIAS_TYPES } from '../constants.js';
import { ForbiddenException, InvalidPayloadException } from '../exceptions/index.js';
import validateCollection from '../middleware/collection-exists.js';
import { respond } from '../middleware/respond.js';
import useCollection from '../middleware/use-collection.js';
import { FieldsService } from '../services/fields.js';
import { getParam } from '../utils/get-param.js';

const router: Router = Router();

router.use(useCollection('directus_fields'));

router.get(
	'/',
	async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const fields = await service.readAll();

		res.locals['payload'] = { data: fields || null };
		return next();
	},
	respond
);

router.get(
	'/:collection',
	validateCollection,
	async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const fields = await service.readAll(getParam(req, 'collection')!);

		res.locals['payload'] = { data: fields || null };
		return next();
	},
	respond
);

router.get(
	'/:collection/:field',
	validateCollection,
	async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const field = await service.readOne(getParam(req, 'collection')!, getParam(req, 'field')!);

		res.locals['payload'] = { data: field || null };
		return next();
	},
	respond
);

const newFieldSchema = Joi.object({
	collection: Joi.string().optional(),
	field: Joi.string().required(),
	type: Joi.string()
		.valid(...TYPES, ...ALIAS_TYPES)
		.allow(null)
		.optional(),
	schema: Joi.object({
		default_value: Joi.any(),
		max_length: [Joi.number(), Joi.string(), Joi.valid(null)],
		is_nullable: Joi.bool(),
	})
		.unknown()
		.allow(null),
	meta: Joi.any(),
});

router.post(
	'/:collection',
	validateCollection,
	async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const { error } = newFieldSchema.validate(req.body || {});

		if (error) {
			throw new InvalidPayloadException(error.message);
		}

		const field: Partial<Field> & { field: string; type: Type | null } = req.body;

		await service.createField(getParam(req, 'collection')!, field);

		try {
			const createdField = await service.readOne(getParam(req, 'collection')!, field.field);
			res.locals['payload'] = { data: createdField || null };
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

router.patch(
	'/:collection',
	validateCollection,
	async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		if (Array.isArray(req.body) === false) {
			throw new InvalidPayloadException('Submitted body has to be an array.');
		}

		for (const field of req.body) {
			await service.updateField(getParam(req, 'collection')!, field);
		}

		try {
			const results: any = [];

			for (const field of req.body) {
				const updatedField = await service.readOne(getParam(req, 'collection')!, field.field);
				results.push(updatedField);
				res.locals['payload'] = { data: results || null };
			}
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

const updateSchema = Joi.object({
	type: Joi.string()
		.valid(...TYPES, ...ALIAS_TYPES)
		.allow(null),
	schema: Joi.object({
		default_value: Joi.any(),
		max_length: [Joi.number(), Joi.string(), Joi.valid(null)],
		is_nullable: Joi.bool(),
	})
		.unknown()
		.allow(null),
	meta: Joi.any(),
}).unknown();

router.patch(
	'/:collection/:field',
	validateCollection,
	async (req, res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const { error } = updateSchema.validate(req.body || {});

		if (error) {
			throw new InvalidPayloadException(error.message);
		}

		if (req.body?.schema && !req.body?.type) {
			throw new InvalidPayloadException(`You need to provide "type" when providing "schema".`);
		}

		const fieldData: Partial<Field> & { field: string; type: Type } = req.body || {};

		if (!fieldData.field) fieldData.field = getParam(req, 'field')!;

		await service.updateField(getParam(req, 'collection')!, fieldData);

		try {
			const updatedField = await service.readOne(getParam(req, 'collection')!, getParam(req, 'field')!);
			res.locals['payload'] = { data: updatedField || null };
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
	'/:collection/:field',
	validateCollection,
	async (req, _res, next) => {
		const service = new FieldsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		await service.deleteField(getParam(req, 'collection')!, getParam(req, 'field')!);
		return next();
	},
	respond
);

export default router;
