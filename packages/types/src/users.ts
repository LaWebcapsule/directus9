export type Role = {
	id: string;
	name: string;
	description: string;
	icon: string;
	enforce_tfa: null | boolean;
	external_id: null | string;
	ip_whitelist: string[];
	app_access: boolean;
	admin_access: boolean;
};

export type Avatar = {
	id: string;
};

// There's more data returned in thumbnails and the avatar data, but we
// only care about the thumbnails in this context

export type User = {
	avatar: null | Avatar;
	company: string | null;
	email_notifications: boolean;
	email: string;
	external_id: string;
	first_name: string;
	id: string;
	language: string;
	last_login: string;
	last_name: string;
	last_page: string;
	password_reset_token: string | null;
	role: Role;
	status: string;
	tfa_secret: string;
	theme: 'auto' | 'dark' | 'light';
	timezone: string;
	title: string | null;
	token: string;
};
