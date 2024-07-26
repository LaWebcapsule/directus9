import type { CookieOptions } from 'express';
import env from './env.js';
import type { TransformationParams } from './types/index.js';
import { getMilliseconds } from './utils/get-milliseconds.js';

export const SYSTEM_ASSET_ALLOW_LIST: TransformationParams[] = [
	{
		key: 'system-small-cover',
		format: 'auto',
		transforms: [['resize', { width: 64, height: 64, fit: 'cover' }]],
	},
	{
		key: 'system-small-contain',
		format: 'auto',
		transforms: [['resize', { width: 64, fit: 'contain' }]],
	},
	{
		key: 'system-medium-cover',
		format: 'auto',
		transforms: [['resize', { width: 300, height: 300, fit: 'cover' }]],
	},
	{
		key: 'system-medium-contain',
		format: 'auto',
		transforms: [['resize', { width: 300, fit: 'contain' }]],
	},
	{
		key: 'system-large-cover',
		format: 'auto',
		transforms: [['resize', { width: 800, height: 800, fit: 'cover' }]],
	},
	{
		key: 'system-large-contain',
		format: 'auto',
		transforms: [['resize', { width: 800, fit: 'contain' }]],
	},
];

export const ASSET_TRANSFORM_QUERY_KEYS: Array<keyof TransformationParams> = [
	'key',
	'transforms',
	'width',
	'height',
	'format',
	'fit',
	'quality',
	'withoutEnlargement',
];

export const FILTER_VARIABLES = ['$NOW', '$CURRENT_USER', '$CURRENT_ROLE'];

export const ALIAS_TYPES = ['alias', 'o2m', 'm2m', 'm2a', 'o2a', 'files', 'translations'];

export const DEFAULT_AUTH_PROVIDER = 'default';

export const COLUMN_TRANSFORMS = ['year', 'month', 'day', 'weekday', 'hour', 'minute', 'second'];

export const GENERATE_SPECIAL = ['uuid', 'date-created', 'role-created', 'user-created'];

export const UUID_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
	httpOnly: true,
	domain: env['REFRESH_TOKEN_COOKIE_DOMAIN'],
	maxAge: getMilliseconds(env['REFRESH_TOKEN_TTL']),
	secure: env['REFRESH_TOKEN_COOKIE_SECURE'] ?? false,
	sameSite: (env['REFRESH_TOKEN_COOKIE_SAME_SITE'] as 'lax' | 'strict' | 'none') || 'strict',
	path: '/auth',
};

const {
	maxAge: refreshCookieMaxAge,
	expires: refreshCookieExpires,
	...refresh_cookie_clear_options
} = REFRESH_COOKIE_OPTIONS;

export const REFRESH_COOKIE_CLEAR_OPTIONS: CookieOptions = refresh_cookie_clear_options;

export const GET_SET_HEADER = (cookieValue: string) => {
	const domainHeader = env['REFRESH_TOKEN_COOKIE_DOMAIN'] ? ` Domain=${env['REFRESH_TOKEN_COOKIE_DOMAIN']};` : '';
	const partitionedHeader = env['REFRESH_TOKEN_COOKIE_PARTITIONED'] == true ? ' Partitioned;' : '';

	const cookieHeaderValue = `${env['REFRESH_TOKEN_COOKIE_NAME']}=${cookieValue}; HttpOnly; Max-Age=${getMilliseconds(
		env['REFRESH_TOKEN_TTL']
	)}; Secure=${env['REFRESH_TOKEN_COOKIE_SECURE'] ?? false}; SameSite=${
		(env['REFRESH_TOKEN_COOKIE_SAME_SITE'] as 'lax' | 'strict' | 'none') || 'strict'
	}; Path=/auth;${domainHeader}${partitionedHeader}`;

	return cookieHeaderValue;
};

export const ACCESS_COOKIE_OPTIONS: CookieOptions = {
	httpOnly: true,
	domain: env['ACCESS_TOKEN_COOKIE_DOMAIN'],
	maxAge: getMilliseconds(env['ACCESS_TOKEN_TTL']),
	secure: env['ACCESS_TOKEN_COOKIE_SECURE'] ?? false,
	sameSite: (env['ACCESS_TOKEN_COOKIE_SAME_SITE'] as 'lax' | 'strict' | 'none') || 'strict',
	path: '/',
};

const {
	maxAge: accessCookieMaxAge,
	expires: accessCookieExpires,
	...access_cookie_clear_options
} = ACCESS_COOKIE_OPTIONS;

export const ACCESS_COOKIE_CLEAR_OPTIONS: CookieOptions = access_cookie_clear_options;

export const OAS_REQUIRED_SCHEMAS = ['Diff', 'Schema', 'Query', 'x-metadata'];

/** Formats from which transformation is supported */
export const SUPPORTED_IMAGE_TRANSFORM_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/avif'];

/** Formats where metadata extraction is supported */
export const SUPPORTED_IMAGE_METADATA_FORMATS = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/tiff',
	'image/avif',
];

export const REDACT_TEXT = '--redact--';
