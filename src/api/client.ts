import { Platform } from 'react-native';

import type { ServiceResponse } from '../types';

// Android emulators reach the host machine through 10.0.2.2.
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = `http://${DEV_HOST}:8080`;

export class ApiError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = 'ApiError';
		this.statusCode = statusCode;
	}
}

type QueryParams = Record<string, string | number | undefined>;

function buildQuery(params?: QueryParams): string {
	if (!params) {
		return '';
	}

	const entries = Object.entries(params).filter(
		([, value]) => value !== undefined && value !== '',
	);

	if (entries.length === 0) {
		return '';
	}

	const query = entries
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
		)
		.join('&');

	return `?${query}`;
}

export async function apiGet<T>(
	path: string,
	params?: QueryParams,
	signal?: AbortSignal,
): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
		signal,
		headers: { Accept: 'application/json' },
	});

	let body: ServiceResponse<T>;

	try {
		body = (await response.json()) as ServiceResponse<T>;
	} catch {
		throw new ApiError(`Unexpected response (${response.status})`, response.status);
	}

	if (!response.ok || !body.success) {
		throw new ApiError(body.message ?? `Request failed (${response.status})`, response.status);
	}

	return body.responseObject as T;
}
