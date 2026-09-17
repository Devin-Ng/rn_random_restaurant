import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

type Props = {
	label: string;
	onPress: () => void;
	variant?: 'accent' | 'ghost';
	disabled?: boolean;
};

export function PrimaryButton({
	label,
	onPress,
	variant = 'accent',
	disabled = false,
}: Props) {
	const isAccent = variant === 'accent';

	return (
		<Pressable
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				isAccent ? styles.accent : styles.ghost,
				pressed && styles.pressed,
				disabled && styles.disabled,
			]}>
			<Text style={[styles.label, isAccent ? styles.accentLabel : styles.ghostLabel]}>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.lg,
		borderRadius: radius.pill,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	accent: {
		backgroundColor: colors.accent,
		borderColor: colors.accent,
	},
	ghost: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
	},
	pressed: {
		opacity: 0.8,
	},
	disabled: {
		opacity: 0.4,
	},
	label: {
		fontSize: typography.subheading,
		fontWeight: '700',
	},
	accentLabel: {
		color: colors.background,
	},
	ghostLabel: {
		color: colors.text,
	},
});
