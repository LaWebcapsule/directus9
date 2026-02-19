import express from 'express';
import type { RequestHandler } from 'express';
import { respond } from '../middleware/respond.js';
import useCollection from '../middleware/use-collection.js';
import { validateBatch } from '../middleware/validate-batch.js';
import { MetaService } from '../services/meta.js';
import { RevisionsService } from '../services/revisions.js';
import { getParam } from '../utils/get-param.js';

const router: express.Router = express.Router();

router.use(useCollection('directus_revisions'));

const readHandler: RequestHandler = async (req, res, next) => {
	const service = new RevisionsService({
		accountability: req.accountability,
		schema: req.schema,
	});

	const metaService = new MetaService({
		accountability: req.accountability,
		schema: req.schema,
	});

	const records = await service.readByQuery(req.sanitizedQuery);
	const meta = await metaService.getMetaForQuery('directus_revisions', req.sanitizedQuery);

	res.locals['payload'] = { data: records || null, meta };
	return next();
};

router.get('/', validateBatch('read'), readHandler, respond);
router.search('/', validateBatch('read'), readHandler, respond);

router.get(
	'/:pk',
	async (req, res, next) => {
		const service = new RevisionsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const record = await service.readOne(getParam(req, 'pk')!, req.sanitizedQuery);

		res.locals['payload'] = { data: record || null };
		return next();
	},
	respond
);

export default router;
