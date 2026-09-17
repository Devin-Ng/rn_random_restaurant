import { apiGet } from './client';
import type { MainDish, Restaurant, RestaurantFilters } from '../types';

function toParams(filters?: RestaurantFilters) {
	if (!filters) {
		return undefined;
	}

	return {
		region: filters.region,
		district: filters.district,
		dishType: filters.dishType,
		minRating: filters.minRating,
	};
}

export function getRestaurants(filters?: RestaurantFilters, signal?: AbortSignal) {
	return apiGet<Restaurant[]>('/restaurants', toParams(filters), signal);
}

export function getRandomRestaurant(
	filters?: RestaurantFilters,
	signal?: AbortSignal,
) {
	return apiGet<Restaurant>('/restaurants/random', toParams(filters), signal);
}

export function getRestaurant(id: number, signal?: AbortSignal) {
	return apiGet<Restaurant>(`/restaurants/${id}`, undefined, signal);
}

export function getRestaurantDishes(id: number, signal?: AbortSignal) {
	return apiGet<MainDish[]>(`/restaurants/${id}/dishes`, undefined, signal);
}
