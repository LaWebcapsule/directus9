import type { RequestHandler } from 'express';
import { getPermissions as getPermissionsUtil } from '../utils/get-permissions.js';

const getPermissions: RequestHandler = async (req, _res, next) => {
	if (!req.accountability) {
		throw new Error('getPermissions middleware needs to be called after authenticate');
	}

	req.accountability.permissions = await getPermissionsUtil(req.accountability, req.schema);

	return next();
};

export default getPermissions;
