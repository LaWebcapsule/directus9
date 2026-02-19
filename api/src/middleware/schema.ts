import type { RequestHandler } from 'express';
import { getSchema } from '../utils/get-schema.js';

const schema: RequestHandler = async (req, _res, next) => {
	req.schema = await getSchema();
	return next();
};

export default schema;
