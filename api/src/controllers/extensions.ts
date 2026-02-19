import { EXTENSION_TYPES } from '@wbce-d9/constants';
import type { Plural } from '@wbce-d9/types';
import { depluralize, isIn } from '@wbce-d9/utils';
import { Router } from 'express';
import env from '../env.js';
import { RouteNotFoundException } from '../exceptions/index.js';
import { getExtensionManager } from '../extensions.js';
import { respond } from '../middleware/respond.js';
import { getCacheControlHeader } from '../utils/get-cache-headers.js';
import { getParam } from '../utils/get-param.js';
import { getMilliseconds } from '../utils/get-milliseconds.js';

const router: Router = Router();

router.get(
	'/:type',
	async (req, res, next) => {
		const type = depluralize(getParam(req, 'type') as Plural<string>);

		if (!isIn(type, EXTENSION_TYPES)) {
			throw new RouteNotFoundException(req.path);
		}

		const extensionManager = getExtensionManager();

		const extensions = extensionManager.getExtensionsList(type);

		res.locals['payload'] = {
			data: extensions,
		};

		return next();
	},
	respond
);

router.get(
	'/sources/:chunk',
	async (req, res) => {
		const chunk = getParam(req, 'chunk')!;
		const extensionManager = getExtensionManager();

		let source: string | null;

		if (chunk === 'index.js') {
			source = extensionManager.getAppExtensions();
		} else {
			source = extensionManager.getAppExtensionChunk(chunk);
		}

		if (source === null) {
			throw new RouteNotFoundException(req.path);
		}

		res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');

		res.setHeader(
			'Cache-Control',
			getCacheControlHeader(req, getMilliseconds(env['EXTENSIONS_CACHE_TTL']), false, false)
		);

		res.setHeader('Vary', 'Origin, Cache-Control');
		res.end(source);
	}
);

export default router;
