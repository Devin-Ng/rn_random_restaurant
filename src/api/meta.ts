import { apiGet } from './client';
import type { FilterOptions } from '../types';

export function getFilterOptions(signal?: AbortSignal) {
	return apiGet<FilterOptions>('/meta/filters', undefined, signal);
}
