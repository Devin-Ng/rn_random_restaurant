import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getRandomRestaurant, getRestaurants } from '../api/restaurants';
import {
	EffectsWebView,
	type EffectsWebViewHandle,
	type WebViewPayload,
} from '../components/EffectsWebView';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';
import { describeFilters } from '../store/filterStore';
import { colors, spacing, typography } from '../theme';
import type { Restaurant } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Pick'>;
type PickRoute = RouteProp<RootStackParamList, 'Pick'>;

const RING_SIZE = 12;

export function PickScreen() {
	const navigation = useNavigation<Nav>();
	const route = useRoute<PickRoute>();
	const filters = route.params.filters;

	const webRef = useRef<EffectsWebViewHandle>(null);
	const startedRef = useRef(false);
	const winnerRef = useRef<Restaurant | null>(null);

	const [webReady, setWebReady] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		winnerRef.current = null;
		startedRef.current = false;
	}, [filters]);

	useEffect(() => {
		if (!webReady || startedRef.current) {
			return;
		}
		startedRef.current = true;

		const controller = new AbortController();

		Promise.all([
			getRandomRestaurant(filters, controller.signal),
			getRestaurants(filters, controller.signal),
		])
			.then(([picked, pool]) => {
				winnerRef.current = picked;

				// Shuffle so the wheel shows a varied mix, with the winner pinned in.
				const shuffled = pool
					.map(restaurant => restaurant.name)
					.filter(name => name !== picked.name);

				for (let i = shuffled.length - 1; i > 0; i -= 1) {
					const j = Math.floor(Math.random() * (i + 1));
					[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
				}

				const ring = [picked.name, ...shuffled.slice(0, RING_SIZE - 1)];

				webRef.current?.send({
					type: 'candidates',
					names: ring,
					winner: picked.name,
				});
			})
			.catch(exception => {
				if (exception.name !== 'AbortError') {
					setError(exception.message);
				}
			});

		return () => controller.abort();
	}, [webReady, filters]);

	const handleMessage = useCallback(
		(payload: WebViewPayload) => {
			if (payload.type === 'ready') {
				setWebReady(true);
				return;
			}

			if (payload.type === 'spinComplete') {
				const winner = winnerRef.current;
				if (!winner) {
					return;
				}
				setTimeout(() => {
					navigation.replace('Detail', {
						restaurantId: winner.id,
						filters,
					});
				}, 1400);
			}
		},
		[filters, navigation],
	);

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorTitle}>Could not load the wheel</Text>
				<Text style={styles.errorBody}>{error}</Text>
				<PrimaryButton label="Back" variant="ghost" onPress={() => navigation.goBack()} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<EffectsWebView ref={webRef} mode="pick" onMessage={handleMessage} />
			{!webReady ? (
				<View style={styles.loading}>
					<ActivityIndicator color={colors.accent} />
					<Text style={styles.loadingText}>{describeFilters(filters)}</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	centered: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.background,
		padding: spacing.lg,
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
	loading: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: spacing.xxl,
		alignItems: 'center',
	},
	loadingText: {
		color: colors.textMuted,
		marginTop: spacing.sm,
		fontSize: typography.caption,
	},
});
