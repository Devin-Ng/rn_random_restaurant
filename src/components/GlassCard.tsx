import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '../theme';

type Props = ViewProps & {
	strong?: boolean;
};

export function GlassCard({ style, strong = false, ...rest }: Props) {
	return (
		<View
			style={[styles.card, strong && styles.cardStrong, style]}
			{...rest}
		/>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
	},
	cardStrong: {
		backgroundColor: colors.surfaceStrong,
		borderColor: colors.borderStrong,
	},
});
