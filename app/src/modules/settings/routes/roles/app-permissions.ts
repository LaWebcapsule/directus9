import { Permission } from '@directus9/types';

export const appRecommendedPermissions: Partial<Permission>[] = [
	{
		collection: 'directus9_files',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_files',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_files',
		action: 'update',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_files',
		action: 'delete',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_dashboards',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_dashboards',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_dashboards',
		action: 'update',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_dashboards',
		action: 'delete',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_panels',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_panels',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_panels',
		action: 'update',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_panels',
		action: 'delete',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_folders',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_folders',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_folders',
		action: 'update',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_folders',
		action: 'delete',
		permissions: {},
	},
	{
		collection: 'directus9_users',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_users',
		action: 'update',
		permissions: {
			id: {
				_eq: '$CURRENT_USER',
			},
		},
		fields: [
			'first_name',
			'last_name',
			'email',
			'password',
			'location',
			'title',
			'description',
			'avatar',
			'language',
			'theme',
			'tfa_secret',
		],
	},
	{
		collection: 'directus9_roles',
		action: 'read',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_shares',
		action: 'read',
		permissions: {
			_or: [
				{
					role: {
						_eq: '$CURRENT_ROLE',
					},
				},
				{
					role: {
						_null: true,
					},
				},
			],
		},
		fields: ['*'],
	},
	{
		collection: 'directus9_shares',
		action: 'create',
		permissions: {},
		fields: ['*'],
	},
	{
		collection: 'directus9_shares',
		action: 'update',
		permissions: {
			user_created: {
				_eq: '$CURRENT_USER',
			},
		},
		fields: ['*'],
	},
	{
		collection: 'directus9_shares',
		action: 'delete',
		permissions: {
			user_created: {
				_eq: '$CURRENT_USER',
			},
		},
		fields: ['*'],
	},
	{
		collection: 'directus9_flows',
		action: 'read',
		permissions: {
			trigger: {
				_eq: 'manual',
			},
		},
		fields: ['id', 'name', 'icon', 'color', 'options', 'trigger'],
	},
];

export const appMinimalPermissions: Partial<Permission>[] = [
	{
		collection: 'directus9_activity',
		action: 'read',
		permissions: {
			user: {
				_eq: '$CURRENT_USER',
			},
		},
	},
	{
		collection: 'directus9_activity',
		action: 'create',
		validation: {
			comment: {
				_nnull: true,
			},
		},
	},
	{
		collection: 'directus9_collections',
		action: 'read',
	},
	{
		collection: 'directus9_fields',
		action: 'read',
	},
	{
		collection: 'directus9_permissions',
		action: 'read',
		permissions: {
			role: {
				_eq: '$CURRENT_ROLE',
			},
		},
	},
	{
		collection: 'directus9_presets',
		action: 'read',
		permissions: {
			_or: [
				{
					user: {
						_eq: '$CURRENT_USER',
					},
				},
				{
					_and: [
						{
							user: {
								_null: true,
							},
						},
						{
							role: {
								_eq: '$CURRENT_ROLE',
							},
						},
					],
				},
				{
					_and: [
						{
							user: {
								_null: true,
							},
						},
						{
							role: {
								_null: true,
							},
						},
					],
				},
			],
		},
	},
	{
		collection: 'directus9_presets',
		action: 'create',
		validation: {
			user: {
				_eq: '$CURRENT_USER',
			},
		},
	},
	{
		collection: 'directus9_presets',
		action: 'update',
		permissions: {
			user: {
				_eq: '$CURRENT_USER',
			},
		},
	},
	{
		collection: 'directus9_presets',
		action: 'delete',
		permissions: {
			user: {
				_eq: '$CURRENT_USER',
			},
		},
	},
	{
		collection: 'directus9_relations',
		action: 'read',
	},
	{
		collection: 'directus9_roles',
		action: 'read',
		permissions: {
			id: {
				_eq: '$CURRENT_ROLE',
			},
		},
	},
	{
		collection: 'directus9_settings',
		action: 'read',
	},
	{
		collection: 'directus9_shares',
		action: 'read',
		permissions: {
			user_created: {
				_eq: '$CURRENT_USER',
			},
		},
	},
	{
		collection: 'directus9_users',
		action: 'read',
		permissions: {
			id: {
				_eq: '$CURRENT_USER',
			},
		},
		fields: [
			'id',
			'first_name',
			'last_name',
			'last_page',
			'email',
			'password',
			'location',
			'title',
			'description',
			'tags',
			'preferences_divider',
			'avatar',
			'language',
			'theme',
			'tfa_secret',
			'status',
			'role',
		],
	},
];
