import { logout, LogoutReason, refresh } from '@/auth';
import { useRequestsStore } from '@/stores/requests';
import { getRootPath } from '@/utils/get-root-path';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { addQueryToPath } from './utils/add-query-to-path';
import PQueue, { Options, DefaultAddOptions } from 'p-queue';

const api = axios.create({
	baseURL: getRootPath(),
	withCredentials: true,
});

let queue = new PQueue({ concurrency: 5, intervalCap: 5, interval: 500, carryoverConcurrencyCount: true });

interface RequestConfig extends AxiosRequestConfig {
	id: string;
}

interface Response extends AxiosResponse {
	config: RequestConfig;
}

export interface RequestError extends AxiosError {
	response: Response;
}

export const onRequest = (config: AxiosRequestConfig): Promise<RequestConfig> => {
	const requestsStore = useRequestsStore();
	const id = requestsStore.startRequest();

	const requestConfig: RequestConfig = {
		id: id,
		...config,
	};

	return new Promise((resolve) => {
		if (config.url && config.url === '/auth/refresh') {
			queue.pause();
			resolve(requestConfig);
			queue.start();
		} else {
			queue.add(() => resolve(requestConfig));
		}
	});
};

export const onResponse = (response: AxiosResponse | Response): AxiosResponse | Response => {
	const requestsStore = useRequestsStore();
	const id = (response.config as RequestConfig)?.id;
	if (id) requestsStore.endRequest(id);
	return response;
};

export const onError = async (error: RequestError): Promise<RequestError> => {
	const requestsStore = useRequestsStore();

	// Note: Cancelled requests don't respond with the config
	const id = (error.response?.config as RequestConfig)?.id;

	if (id) requestsStore.endRequest(id);

	// If a request fails with the unauthorized error, it either means that your user doesn't have
	// access, or that your session doesn't exist / has expired.
	// In case of the second, we should force the app to logout completely and redirect to the login
	// view.
	const status = error.response?.status;
	const code = error.response?.data?.errors?.[0]?.extensions?.code;

	if (
		status === 401 &&
		code === 'INVALID_CREDENTIALS' &&
		error.request.responseURL.includes('refresh') === false &&
		error.request.responseURL.includes('login') === false &&
		error.request.responseURL.includes('tfa') === false
	) {
		let newToken: string | undefined;

		try {
			newToken = await refresh();
		} catch {
			logout({ reason: LogoutReason.SESSION_EXPIRED });
			return Promise.reject();
		}

		if (newToken) {
			return api.request({
				...error.config,
				headers: {
					Authorization: `Bearer ${newToken}`,
				},
			});
		}
	}

	// Logout if token is invalid
	if (status === 401 && code === 'INVALID_TOKEN') {
		logout({ reason: LogoutReason.SESSION_EXPIRED });
		return Promise.reject(error);
	}

	return Promise.reject(error);
};

api.interceptors.request.use(onRequest);
api.interceptors.response.use(onResponse, onError);

export default api;

export function getToken(): string | null {
	return api.defaults.headers.common['Authorization']?.split(' ')[1] || null;
}

export function addTokenToURL(url: string, token?: string): string {
	const accessToken = token || getToken();
	if (!accessToken) return url;

	return addQueryToPath(url, { access_token: accessToken });
}

export async function replaceQueue(options?: Options<any, DefaultAddOptions>) {
	await queue.onIdle();
	queue = new PQueue(options);
}
