import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
	EffectsWebView,
	type WebViewPayload,
} from '../components/EffectsWebView';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
	const navigation = useNavigation<Nav>();
	const [ready, setReady] = useState(false);
	const [timedOut, setTimedOut] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setTimedOut(true), 3000);
		return () => clearTimeout(timer);
	}, []);

	const handleMessage = useCallback(
		(payload: WebViewPayload) => {
			if (payload.type === 'ready') {
				setReady(true);
				return;
			}

			if (payload.type === 'action' && payload.action === 'pick') {
				navigation.navigate('Pick', { filters: {} });
				return;
			}

			if (payload.type === 'action' && payload.action === 'filters') {
				navigation.navigate('Filters');
			}
		},
		[navigation],
	);

	const showFallback = timedOut && !ready;

	return (
		<View style={styles.container}>
			<EffectsWebView mode="home" onMessage={handleMessage} />
			{showFallback ? (
				<View style={styles.fallback}>
					<PrimaryButton
						label="Pick a restaurant"
						onPress={() => navigation.navigate('Pick', { filters: {} })}
					/>
					<View style={styles.gap} />
					<PrimaryButton
						label="Filters"
						variant="ghost"
						onPress={() => navigation.navigate('Filters')}
					/>
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
	fallback: {
		position: 'absolute',
		left: spacing.lg,
		right: spacing.lg,
		bottom: spacing.xxl,
	},
	gap: {
		height: spacing.sm,
	},
});
