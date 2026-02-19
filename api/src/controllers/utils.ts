import argon2 from 'argon2';
import Busboy from 'busboy';
import { Router } from 'express';
import Joi from 'joi';
import { flushCaches } from '../cache.js';
import {
	ForbiddenException,
	InvalidPayloadException,
	InvalidQueryException,
	UnsupportedMediaTypeException,
} from '../exceptions/index.js';
import collectionExists from '../middleware/collection-exists.js';
import { respond } from '../middleware/respond.js';
import { ExportService, ImportService } from '../services/import-export.js';
import { RevisionsService } from '../services/revisions.js';
import { UtilsService } from '../services/utils.js';
import { generateHash } from '../utils/generate-hash.js';
import { getParam } from '../utils/get-param.js';
import { sanitizeQuery } from '../utils/sanitize-query.js';

const router: Router = Router();

const randomStringSchemaDesc = Joi.object<{ length: number }>({
	length: Joi.number().integer().min(1).max(500).default(32),
});

router.get(
	'/random/string',
	async (req, res) => {
		const { nanoid } = await import('nanoid');

		const { error, value } = randomStringSchemaDesc.validate(req.query, { allowUnknown: true });

		if (error) throw new InvalidQueryException(error.message);

		const string = nanoid(value.length);

		return res.json({ data: string });
	}
);

router.post(
	'/hash/generate',
	async (req, res) => {
		if (!req.body?.string) {
			throw new InvalidPayloadException(`"string" is required`);
		}

		const hash = await generateHash(req.body.string);

		return res.json({ data: hash });
	}
);

router.post(
	'/hash/verify',
	async (req, res) => {
		if (!req.body?.string) {
			throw new InvalidPayloadException(`"string" is required`);
		}

		if (!req.body?.hash) {
			throw new InvalidPayloadException(`"hash" is required`);
		}

		const result = await argon2.verify(req.body.hash, req.body.string);

		return res.json({ data: result });
	}
);

const SortSchema = Joi.object({
	item: Joi.alternatives(Joi.string(), Joi.number()).required(),
	to: Joi.alternatives(Joi.string(), Joi.number()).required(),
});

router.post(
	'/sort/:collection',
	collectionExists,
	async (req, res) => {
		const { error } = SortSchema.validate(req.body);
		if (error) throw new InvalidPayloadException(error.message);

		const service = new UtilsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		await service.sort(req.collection, req.body);

		return res.status(200).end();
	}
);

router.post(
	'/revert/:revision',
	async (req, _res, next) => {
		const service = new RevisionsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		await service.revert(getParam(req, 'revision')!);
		next();
	},
	respond
);

router.post(
	'/import/:collection',
	collectionExists,
	async (req, res, next) => {
		if (req.is('multipart/form-data') === false)
			throw new UnsupportedMediaTypeException(`Unsupported Content-Type header`);

		const service = new ImportService({
			accountability: req.accountability,
			schema: req.schema,
		});

		let headers;

		if (req.headers['content-type']) {
			headers = req.headers;
		} else {
			headers = {
				...req.headers,
				'content-type': 'application/octet-stream',
			};
		}

		const busboy = Busboy({ headers });

		busboy.on('file', async (_fieldname, fileStream, { mimeType }) => {
			try {
				await service.import(getParam(req, 'collection')!, mimeType, fileStream);
			} catch (err: any) {
				return next(err);
			}

			return res.status(200).end();
		});

		busboy.on('error', (err: Error) => next(err));

		req.pipe(busboy);
	}
);

router.post(
	'/export/:collection',
	collectionExists,
	async (req, _res, next) => {
		if (!req.body.query) {
			throw new InvalidPayloadException(`"query" is required.`);
		}

		if (!req.body.format) {
			throw new InvalidPayloadException(`"format" is required.`);
		}

		const service = new ExportService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const sanitizedQuery = sanitizeQuery(req.body.query, req.accountability ?? null);

		// We're not awaiting this, as it's supposed to run async in the background
		service.exportToFile(getParam(req, 'collection')!, sanitizedQuery, req.body.format, {
			file: req.body.file,
		});

		return next();
	},
	respond
);

router.post(
	'/cache/clear',
	async (req, res) => {
		if (req.accountability?.admin !== true) {
			throw new ForbiddenException();
		}

		await flushCaches(true);

		res.status(200).end();
	}
);

export default router;
