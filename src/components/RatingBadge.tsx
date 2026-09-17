import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../theme';

type Props = {
	rating: number;
	reviewCount?: number;
};

export function RatingBadge({ rating, reviewCount }: Props) {
	return (
		<View style={styles.container}>
			<Text style={styles.star}>★</Text>
			<Text style={styles.rating}>{rating.toFixed(1)}</Text>
			{reviewCount !== undefined ? (
				<Text style={styles.reviews}>({reviewCount.toLocaleString()})</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	star: {
		color: colors.accentWarm,
		fontSize: typography.body,
		marginRight: 4,
	},
	rating: {
		color: colors.text,
		fontSize: typography.body,
		fontWeight: '700',
	},
	reviews: {
		color: colors.textFaint,
		fontSize: typography.caption,
		marginLeft: 6,
	},
});
