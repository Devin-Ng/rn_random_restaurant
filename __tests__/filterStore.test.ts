/**
 * @format
 */

import { describeFilters, toRestaurantFilters } from '../src/store/filterStore';
import type { FilterState } from '../src/store/filterStore';

function makeState(overrides: Partial<FilterState> = {}): FilterState {
	return {
		region: null,
		district: null,
		dishType: null,
		minRating: 0,
		setRegion: () => {},
		setDistrict: () => {},
		setDishType: () => {},
		setMinRating: () => {},
		reset: () => {},
		...overrides,
	};
}

describe('filter helpers', () => {
	it('builds filters from populated state', () => {
		const filters = toRestaurantFilters(
			makeState({
				region: 'Kowloon',
				district: 'Sham Shui Po',
				dishType: 'Dim Sum',
				minRating: 4,
			}),
		);

		expect(filters).toEqual({
			region: 'Kowloon',
			district: 'Sham Shui Po',
			dishType: 'Dim Sum',
			minRating: 4,
		});
	});

	it('omits empty values', () => {
		expect(toRestaurantFilters(makeState())).toEqual({});
	});

	it('describes active filters', () => {
		expect(describeFilters({ region: 'Kowloon', minRating: 4 })).toBe(
			'Kowloon · 4.0+ rating',
		);
		expect(describeFilters({})).toBe('All Hong Kong');
	});
});
