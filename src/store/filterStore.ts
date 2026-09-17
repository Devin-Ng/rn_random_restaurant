import { create } from 'zustand';

import type { RestaurantFilters } from '../types';

export type FilterState = {
	region: string | null;
	district: string | null;
	dishType: string | null;
	minRating: number;
	setRegion: (region: string | null) => void;
	setDistrict: (district: string | null) => void;
	setDishType: (dishType: string | null) => void;
	setMinRating: (minRating: number) => void;
	reset: () => void;
};

export const useFilterStore = create<FilterState>(set => ({
	region: null,
	district: null,
	dishType: null,
	minRating: 0,
	// Districts belong to a region, so switching region clears the district.
	setRegion: region => set({ region, district: null }),
	setDistrict: district => set({ district }),
	setDishType: dishType => set({ dishType }),
	setMinRating: minRating => set({ minRating }),
	reset: () =>
		set({ region: null, district: null, dishType: null, minRating: 0 }),
}));

export function toRestaurantFilters(state: FilterState): RestaurantFilters {
	const filters: RestaurantFilters = {};

	if (state.region) {
		filters.region = state.region;
	}
	if (state.district) {
		filters.district = state.district;
	}
	if (state.dishType) {
		filters.dishType = state.dishType;
	}
	if (state.minRating > 0) {
		filters.minRating = state.minRating;
	}

	return filters;
}

export function describeFilters(filters: RestaurantFilters): string {
	const parts: string[] = [];

	if (filters.region) {
		parts.push(filters.region);
	}
	if (filters.district) {
		parts.push(filters.district);
	}
	if (filters.dishType) {
		parts.push(filters.dishType);
	}
	if (filters.minRating) {
		parts.push(`${filters.minRating.toFixed(1)}+ rating`);
	}

	return parts.length > 0 ? parts.join(' · ') : 'All Hong Kong';
}
