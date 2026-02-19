import { format } from 'date-fns';
import { Router } from 'express';
import { RouteNotFoundException } from '../exceptions/index.js';
import { respond } from '../middleware/respond.js';
import { ServerService } from '../services/server.js';
import { SpecificationService } from '../services/specifications.js';
import { getParam } from '../utils/get-param.js';

const router: Router = Router();

router.get(
	'/specs/oas',
	async (req, res, next) => {
		const service = new SpecificationService({
			accountability: req.accountability,
			schema: req.schema,
		});

		res.locals['payload'] = await service.oas.generate();
		return next();
	},
	respond
);

router.get(
	'/specs/graphql{/:scope}',
	async (req, res) => {
		const service = new SpecificationService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const serverService = new ServerService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const scope = getParam(req, 'scope') || 'items';

		if (['items', 'system'].includes(scope) === false) throw new RouteNotFoundException(req.path);

		const info = await serverService.serverInfo();
		const result = await service.graphql.generate(scope as 'items' | 'system');
		const filename = info['project'].project_name + '_' + format(new Date(), 'yyyy-MM-dd') + '.graphql';

		res.attachment(filename);
		res.send(result);
	}
);

router.get(
	'/info',
	async (req, res, next) => {
		const service = new ServerService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const data = await service.serverInfo();
		res.locals['payload'] = { data };
		return next();
	},
	respond
);

router.get(
	'/health',
	async (req, res, next) => {
		const service = new ServerService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const data = await service.health();

		res.setHeader('Content-Type', 'application/health+json');

		if (data['status'] === 'error') res.status(503);
		res.locals['payload'] = data;
		res.locals['cache'] = false;
		return next();
	},
	respond
);

export default router;
