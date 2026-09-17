import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getRestaurant, getRestaurantDishes } from '../api/restaurants';
import { DishCard } from '../components/DishCard';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { RatingBadge } from '../components/RatingBadge';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import type { MainDish, Restaurant } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Detail'>;
type DetailRoute = RouteProp<RootStackParamList, 'Detail'>;

export function DetailScreen() {
	const navigation = useNavigation<Nav>();
	const route = useRoute<DetailRoute>();
	const insets = useSafeAreaInsets();
	const { restaurantId, filters } = route.params;

	const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
	const [dishes, setDishes] = useState<MainDish[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);

		Promise.all([
			getRestaurant(restaurantId, controller.signal),
			getRestaurantDishes(restaurantId, controller.signal),
		])
			.then(([restaurantData, dishData]) => {
				setRestaurant(restaurantData);
				setDishes(dishData);
				setError(null);
			})
			.catch(exception => {
				if (exception.name !== 'AbortError') {
					setError(exception.message);
				}
			})
			.finally(() => setLoading(false));

		return () => controller.abort();
	}, [restaurantId]);

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator color={colors.accent} />
			</View>
		);
	}

	if (error || !restaurant) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorTitle}>Could not load this restaurant</Text>
				<Text style={styles.errorBody}>{error ?? 'Unknown error'}</Text>
				<PrimaryButton label="Back" variant="ghost" onPress={() => navigation.goBack()} />
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={[
				styles.content,
				{ paddingTop: insets.top + 64, paddingBottom: insets.bottom + spacing.xxl },
			]}>
			<Text style={styles.kicker}>Your pick</Text>
			<Text style={styles.name}>{restaurant.name}</Text>

			<View style={styles.metaRow}>
				<RatingBadge rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
			</View>

			<GlassCard style={styles.details}>
				<DetailRow label="Region" value={restaurant.region} />
				<DetailRow label="District" value={restaurant.district} />
				<DetailRow label="Dish type" value={restaurant.dishType ?? '—'} />
				<DetailRow
					label="Rating"
					value={`${restaurant.rating.toFixed(1)} / 5.0`}
				/>
				<DetailRow
					label="Reviews"
					value={restaurant.reviewCount.toLocaleString()}
					last
				/>
			</GlassCard>

			<Text style={styles.sectionTitle}>Signature dishes</Text>
			{dishes.length > 0 ? (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.dishRow}>
					{dishes.map(dish => (
						<DishCard key={dish.id} dish={dish} />
					))}
				</ScrollView>
			) : (
				<Text style={styles.emptyDishes}>No dishes recorded for this place.</Text>
			)}

			<View style={styles.actions}>
				<PrimaryButton
					label="Pick again"
					onPress={() => navigation.replace('Pick', { filters })}
				/>
				<View style={styles.gap} />
				<PrimaryButton
					label="Adjust filters"
					variant="ghost"
					onPress={() => navigation.navigate('Filters')}
				/>
			</View>
		</ScrollView>
	);
}

function DetailRow({
	label,
	value,
	last = false,
}: {
	label: string;
	value: string;
	last?: boolean;
}) {
	return (
		<View style={[styles.detailRow, last && styles.detailRowLast]}>
			<Text style={styles.detailLabel}>{label}</Text>
			<Text style={styles.detailValue}>{value}</Text>
		</View>
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
	centered: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.background,
		padding: spacing.lg,
	},
	kicker: {
		color: colors.accent,
		letterSpacing: 3,
		textTransform: 'uppercase',
		fontSize: typography.caption,
		fontWeight: '700',
	},
	name: {
		color: colors.text,
		fontSize: typography.title,
		fontWeight: '800',
		marginTop: spacing.sm,
	},
	metaRow: {
		flexDirection: 'row',
		marginTop: spacing.sm,
		marginBottom: spacing.lg,
	},
	details: {
		marginBottom: spacing.lg,
	},
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: spacing.sm,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.border,
	},
	detailRowLast: {
		borderBottomWidth: 0,
	},
	detailLabel: {
		color: colors.textMuted,
		fontSize: typography.body,
	},
	detailValue: {
		color: colors.text,
		fontSize: typography.body,
		fontWeight: '600',
		maxWidth: '60%',
		textAlign: 'right',
	},
	sectionTitle: {
		color: colors.text,
		fontSize: typography.heading,
		fontWeight: '700',
		marginBottom: spacing.md,
	},
	dishRow: {
		paddingBottom: spacing.sm,
	},
	emptyDishes: {
		color: colors.textMuted,
		marginBottom: spacing.md,
	},
	actions: {
		marginTop: spacing.lg,
	},
	errorTitle: {
		color: colors.text,
		fontSize: typography.heading,
		fontWeight: '700',
		marginBottom: spacing.sm,
	},
	errorBody: {
		color: colors.textMuted,
		textAlign: 'center',
		marginBottom: spacing.lg,
	},
	gap: {
		height: spacing.sm,
	},
});
