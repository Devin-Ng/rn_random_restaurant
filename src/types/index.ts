export type Restaurant = {
	id: number;
	name: string;
	region: string;
	district: string;
	dishType: string | null;
	rating: number;
	reviewCount: number;
};

export type MainDish = {
	id: number;
	restaurantId: number;
	dishName: string;
	price: number | null;
	photoUrl: string | null;
};

export type RestaurantFilters = {
	region?: string;
	district?: string;
	dishType?: string;
	minRating?: number;
};

export type FilterOptions = {
	regions: string[];
	districtsByRegion: Record<string, string[]>;
	dishTypes: string[];
};

export type ServiceResponse<T> = {
	success: boolean;
	message: string;
	responseObject?: T;
	statusCode: number;
};
