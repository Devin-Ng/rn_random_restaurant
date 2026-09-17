import type { RestaurantFilters } from '../types';

export type RootStackParamList = {
	Home: undefined;
	Filters: undefined;
	Pick: { filters: RestaurantFilters };
	Detail: { restaurantId: number; filters: RestaurantFilters };
};
