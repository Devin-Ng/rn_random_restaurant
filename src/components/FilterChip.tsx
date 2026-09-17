import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type Props = {
	label: string;
	selected?: boolean;
	onPress: () => void;
};

export function FilterChip({ label, selected = false, onPress }: Props) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.chip,
				selected && styles.chipSelected,
				pressed && styles.chipPressed,
			]}>
			<Text
				numberOfLines={1}
				style={[styles.label, selected && styles.labelSelected]}>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	chip: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderRadius: radius.pill,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		marginRight: spacing.sm,
		marginBottom: spacing.sm,
	},
	chipSelected: {
		backgroundColor: colors.accent,
		borderColor: colors.accent,
	},
	chipPressed: {
		opacity: 0.75,
	},
	label: {
		color: colors.text,
		fontSize: typography.caption,
		fontWeight: '600',
	},
	labelSelected: {
		color: colors.background,
	},
});
