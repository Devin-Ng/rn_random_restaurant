import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { MainDish } from '../types';

type Props = {
	dish: MainDish;
};

export function DishCard({ dish }: Props) {
	const [failed, setFailed] = useState(false);
	const hasPhoto = Boolean(dish.photoUrl) && !failed;

	return (
		<View style={styles.card}>
			<View style={styles.photoWrapper}>
				{hasPhoto ? (
					<Image
						style={styles.photo}
						source={{ uri: dish.photoUrl as string }}
						onError={() => setFailed(true)}
						resizeMode="cover"
					/>
				) : (
					<View style={[styles.photo, styles.placeholder]}>
						<Text style={styles.placeholderText}>No photo</Text>
					</View>
				)}
			</View>
			<View style={styles.info}>
				<Text style={styles.name} numberOfLines={2}>
					{dish.dishName}
				</Text>
				{dish.price !== null ? (
					<Text style={styles.price}>HK${dish.price.toFixed(0)}</Text>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: 190,
		marginRight: spacing.md,
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
	},
	photoWrapper: {
		height: 120,
		backgroundColor: colors.backgroundElevated,
	},
	photo: {
		width: '100%',
		height: '100%',
	},
	placeholder: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	placeholderText: {
		color: colors.textFaint,
		fontSize: typography.caption,
	},
	info: {
		padding: spacing.md,
	},
	name: {
		color: colors.text,
		fontSize: typography.body,
		fontWeight: '600',
	},
	price: {
		marginTop: spacing.xs,
		color: colors.accent,
		fontSize: typography.caption,
		fontWeight: '700',
	},
});
