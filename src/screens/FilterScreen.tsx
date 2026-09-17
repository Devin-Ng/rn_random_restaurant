import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getFilterOptions } from '../api/meta';
import { getRestaurants } from '../api/restaurants';
import { FilterChip } from '../components/FilterChip';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';
import { useFilterStore } from '../store/filterStore';
import { colors, spacing, typography } from '../theme';
import type { FilterOptions, RestaurantFilters } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Filters'>;

const RATING_OPTIONS = [
	{ label: 'Any', value: 0 },
	{ label: '3.5+', value: 3.5 },
	{ label: '4.0+', value: 4 },
	{ label: '4.5+', value: 4.5 },
];

export function FilterScreen() {
	const navigation = useNavigation<Nav>();
	const insets = useSafeAreaInsets();

	const region = useFilterStore(state => state.region);
	const district = useFilterStore(state => state.district);
	const dishType = useFilterStore(state => state.dishType);
	const minRating = useFilterStore(state => state.minRating);
	const setRegion = useFilterStore(state => state.setRegion);
	const setDistrict = useFilterStore(state => state.setDistrict);
	const setDishType = useFilterStore(state => state.setDishType);
	const setMinRating = useFilterStore(state => state.setMinRating);
	const reset = useFilterStore(state => state.reset);

	const [options, setOptions] = useState<FilterOptions | null>(null);
	const [matchCount, setMatchCount] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		getFilterOptions(controller.signal)
			.then(setOptions)
			.catch(exception => {
				if (exception.name !== 'AbortError') {
					setError(exception.message);
				}
			});
		return () => controller.abort();
	}, []);

	const filters: RestaurantFilters = useMemo(() => {
		const next: RestaurantFilters = {};
		if (region) {
			next.region = region;
		}
		if (district) {
			next.district = district;
		}
		if (dishType) {
			next.dishType = dishType;
		}
		if (minRating > 0) {
			next.minRating = minRating;
		}
		return next;
	}, [region, district, dishType, minRating]);

	useEffect(() => {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			getRestaurants(filters, controller.signal)
				.then(list => setMatchCount(list.length))
				.catch(exception => {
					if (exception.name !== 'AbortError') {
						setMatchCount(null);
					}
				});
		}, 250);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [filters]);

	const districts = useMemo(() => {
		if (!options) {
			return [];
		}
		if (region) {
			return options.districtsByRegion[region] ?? [];
		}
		return Array.from(new Set(Object.values(options.districtsByRegion).flat())).sort();
	}, [options, region]);

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={[
				styles.content,
				{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + spacing.xxl },
			]}>
			<Text style={styles.heading}>What are you in the mood for?</Text>
			<Text style={styles.subheading}>
				Narrow the pool, then let the wheel choose.
			</Text>

			{error ? <Text style={styles.error}>{error}</Text> : null}

			<GlassCard style={styles.section}>
				<Text style={styles.sectionTitle}>Region</Text>
				<View style={styles.chipRow}>
					<FilterChip label="Any" selected={!region} onPress={() => setRegion(null)} />
					{options?.regions.map(entry => (
						<FilterChip
							key={entry}
							label={entry}
							selected={region === entry}
							onPress={() => setRegion(region === entry ? null : entry)}
						/>
					))}
				</View>
			</GlassCard>

			<GlassCard style={styles.section}>
				<Text style={styles.sectionTitle}>District</Text>
				<View style={styles.chipRow}>
					<FilterChip label="Any" selected={!district} onPress={() => setDistrict(null)} />
					{districts.map(entry => (
						<FilterChip
							key={entry}
							label={entry}
							selected={district === entry}
							onPress={() => setDistrict(district === entry ? null : entry)}
						/>
					))}
				</View>
			</GlassCard>

			<GlassCard style={styles.section}>
				<Text style={styles.sectionTitle}>Dish type</Text>
				<View style={styles.chipRow}>
					<FilterChip label="Any" selected={!dishType} onPress={() => setDishType(null)} />
					{options?.dishTypes.map(entry => (
						<FilterChip
							key={entry}
							label={entry}
							selected={dishType === entry}
							onPress={() => setDishType(dishType === entry ? null : entry)}
						/>
					))}
				</View>
			</GlassCard>

			<GlassCard style={styles.section}>
				<Text style={styles.sectionTitle}>Minimum rating</Text>
				<View style={styles.chipRow}>
					{RATING_OPTIONS.map(entry => (
						<FilterChip
							key={entry.label}
							label={entry.label}
							selected={minRating === entry.value}
							onPress={() => setMinRating(entry.value)}
						/>
					))}
				</View>
			</GlassCard>

			<View style={styles.summary}>
				{matchCount === null ? (
					<ActivityIndicator color={colors.accent} />
				) : (
					<Text style={styles.summaryText}>
						{matchCount} {matchCount === 1 ? 'place matches' : 'places match'}
					</Text>
				)}
			</View>

			<PrimaryButton
				label="Spin the wheel"
				disabled={matchCount === 0}
				onPress={() => navigation.navigate('Pick', { filters })}
			/>
			<View style={styles.gap} />
			<PrimaryButton label="Reset filters" variant="ghost" onPress={reset} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		paddingHorizontal: spacing.lg,
	},
	heading: {
		color: colors.text,
		fontSize: typography.title,
		fontWeight: '800',
	},
	subheading: {
		color: colors.textMuted,
		fontSize: typography.body,
		marginTop: spacing.xs,
		marginBottom: spacing.lg,
	},
	section: {
		marginBottom: spacing.md,
	},
	sectionTitle: {
		color: colors.text,
		fontSize: typography.subheading,
		fontWeight: '700',
		marginBottom: spacing.md,
	},
	chipRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	summary: {
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: spacing.lg,
		minHeight: 24,
	},
	summaryText: {
		color: colors.accent,
		fontSize: typography.subheading,
		fontWeight: '700',
	},
	error: {
		color: colors.danger,
		marginBottom: spacing.md,
	},
	gap: {
		height: spacing.sm,
	},
});
