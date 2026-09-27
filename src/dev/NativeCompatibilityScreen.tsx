import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {
  CircleCheckBig,
  Keyboard,
  MoveVertical,
  Utensils,
  X,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Path, Svg } from 'react-native-svg';

import { colors, radius, spacing, typography } from '../theme';

const checklist = [
  'Open and close the bottom sheet with the controls below.',
  'Drag the sheet handle and pan down to close it.',
  'Scroll the page and the content inside the sheet.',
  'Focus the sheet input, type, dismiss, and reopen the keyboard.',
  'Confirm the Lucide and direct SVG icons render cleanly.',
  'Toggle the device Reduce motion setting, reopen, and compare motion.',
];

export function NativeCompatibilityScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const [sheetIndex, setSheetIndex] = useState(-1);
  const [query, setQuery] = useState('');
  const reduceMotionEnabled = useReducedMotion();
  const motionProgress = useSharedValue(0);
  const snapPoints = useMemo(() => ['45%', '82%'], []);
  const motionStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: motionProgress.value }],
  }));

  const runMotionCheck = useCallback(() => {
    motionProgress.value = 0;
    motionProgress.value = withTiming(48, {
      duration: 500,
      reduceMotion: ReduceMotion.System,
    });
  }, [motionProgress]);

  const openSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(0);
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
        testID="native-compatibility-page-scroll"
      >
        <View style={styles.eyebrowRow}>
          <Utensils
            accessibilityElementsHidden
            color={colors.accentWarm}
            importantForAccessibility="no-hide-descendants"
            size={18}
            testID="lucide-utensils-icon"
          />
          <Text style={styles.eyebrow}>RR-004 · DEVELOPMENT ONLY</Text>
        </View>
        <Text
          accessibilityRole="header"
          style={styles.title}
          testID="native-compatibility-title"
        >
          Native compatibility lab
        </Text>
        <Text style={styles.intro}>
          A focused manual surface for the native gesture, animation, sheet,
          keyboard, scrolling, Lucide, and SVG stack.
        </Text>

        <View
          accessibilityLabel="Reduced motion status"
          style={styles.statusCard}
        >
          <MoveVertical
            accessibilityElementsHidden
            color={reduceMotionEnabled ? colors.success : colors.accent}
            importantForAccessibility="no-hide-descendants"
            size={22}
          />
          <View style={styles.statusCopy}>
            <Text style={styles.statusLabel}>System reduced motion</Text>
            <Text
              accessibilityLiveRegion="polite"
              style={styles.statusValue}
              testID="reduced-motion-status"
            >
              {reduceMotionEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            accessibilityHint="Runs a short horizontal Reanimated timing check"
            accessibilityLabel="Run reduced motion animation check"
            accessibilityRole="button"
            onPress={runMotionCheck}
            style={({ pressed }) => [
              styles.motionAction,
              pressed && styles.pressed,
            ]}
            testID="run-motion-check"
          >
            <Text style={styles.motionActionText}>Run motion check</Text>
          </Pressable>
          <View
            accessibilityLabel="Reduced motion animation marker track"
            style={styles.motionTrack}
          >
            <Animated.View
              style={[styles.motionMarker, motionStyle]}
              testID="motion-marker"
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            accessibilityHint="Opens the compatibility bottom sheet"
            accessibilityLabel="Open test sheet"
            accessibilityRole="button"
            onPress={openSheet}
            style={({ pressed }) => [
              styles.primaryAction,
              pressed && styles.pressed,
            ]}
            testID="open-native-sheet"
          >
            <Text style={styles.primaryActionText}>Open test sheet</Text>
          </Pressable>
          <Pressable
            accessibilityHint="Closes the compatibility bottom sheet"
            accessibilityLabel="Close test sheet"
            accessibilityRole="button"
            onPress={closeSheet}
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.pressed,
            ]}
            testID="close-native-sheet"
          >
            <Text style={styles.secondaryActionText}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.iconCard}>
          <View style={styles.iconTile}>
            <Keyboard
              accessibilityLabel="Lucide keyboard icon"
              color={colors.accent}
              size={32}
              strokeWidth={1.8}
              testID="lucide-keyboard-icon"
            />
            <Text style={styles.iconCaption}>Lucide</Text>
          </View>
          <View style={styles.iconTile}>
            <Svg
              accessibilityLabel="Direct SVG restaurant pin icon"
              accessibilityRole="image"
              height={32}
              testID="direct-svg-icon"
              viewBox="0 0 32 32"
              width={32}
            >
              <Circle
                cx="16"
                cy="16"
                fill="none"
                r="13"
                stroke={colors.accentWarm}
                strokeWidth="2"
              />
              <Path
                d="M10 18c2-6 10-6 12 0M12 13h8"
                fill="none"
                stroke={colors.accentWarm}
                strokeLinecap="round"
                strokeWidth="2"
              />
            </Svg>
            <Text style={styles.iconCaption}>Direct SVG</Text>
          </View>
        </View>

        <View style={styles.checklistCard}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Manual acceptance checklist
          </Text>
          {checklist.map((item, index) => (
            <View key={item} style={styles.checkRow}>
              <CircleCheckBig
                accessibilityElementsHidden
                color={colors.success}
                importantForAccessibility="no-hide-descendants"
                size={19}
              />
              <Text style={styles.checkText}>{`${index + 1}. ${item}`}</Text>
            </View>
          ))}
        </View>

        <View style={styles.scrollProof}>
          <Text style={styles.scrollProofText}>End of page scroll target</Text>
        </View>
      </ScrollView>

      <BottomSheet
        accessibilityLabel="Native compatibility bottom sheet"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={styles.sheetBackground}
        enableDynamicSizing={false}
        enablePanDownToClose
        handleIndicatorStyle={styles.handleIndicator}
        index={-1}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onChange={setSheetIndex}
        onClose={() => setSheetIndex(-1)}
        overrideReduceMotion={ReduceMotion.System}
        ref={sheetRef}
        snapPoints={snapPoints}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          testID="native-sheet-scroll"
        >
          <View style={styles.sheetHeadingRow}>
            <View>
              <Text accessibilityRole="header" style={styles.sheetTitle}>
                Gesture & keyboard test
              </Text>
              <Text
                accessibilityLiveRegion="polite"
                style={styles.sheetMeta}
                testID="native-sheet-state"
              >
                {sheetIndex < 0 ? 'Closed' : `Snap point ${sheetIndex + 1}`}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close test sheet"
              accessibilityRole="button"
              hitSlop={8}
              onPress={closeSheet}
              style={styles.iconButton}
              testID="close-native-sheet-inside"
            >
              <X
                accessibilityElementsHidden
                color={colors.text}
                importantForAccessibility="no-hide-descendants"
                size={22}
              />
            </Pressable>
          </View>

          <Text style={styles.sheetLabel}>Restaurant search fixture</Text>
          <BottomSheetTextInput
            accessibilityHint="Type to verify keyboard behavior inside the sheet"
            accessibilityLabel="Restaurant search fixture"
            autoCapitalize="words"
            onChangeText={setQuery}
            placeholder="Try ‘dim sum’"
            placeholderTextColor={colors.textFaint}
            returnKeyType="done"
            style={styles.input}
            testID="native-sheet-input"
            value={query}
          />
          <Text
            accessibilityLiveRegion="polite"
            style={styles.inputEcho}
            testID="native-sheet-input-echo"
          >
            {query ? `Input value: ${query}` : 'Input is empty'}
          </Text>

          <Text style={styles.sheetInstruction}>
            Drag the handle, scroll this content, focus the input, and pan down
            to close. The sheet follows the system reduced-motion preference.
          </Text>
          {Array.from({ length: 7 }, (_, index) => (
            <View key={index} style={styles.scrollRow}>
              <Text style={styles.scrollRowIndex}>{index + 1}</Text>
              <Text style={styles.scrollRowText}>
                Scrollable sheet fixture row {index + 1}
              </Text>
            </View>
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageContent: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: 260,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eyebrow: {
    color: colors.accentWarm,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  intro: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 23,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  statusCopy: {
    marginLeft: spacing.md,
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  statusValue: {
    marginTop: 2,
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  motionAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  motionActionText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  motionTrack: {
    flex: 1,
    height: 12,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceStrong,
  },
  motionMarker: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  primaryAction: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  primaryActionText: {
    color: colors.background,
    fontSize: typography.body,
    fontWeight: '800',
  },
  secondaryAction: {
    minWidth: 96,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  secondaryActionText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
  iconCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  iconTile: {
    flex: 1,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
  },
  iconCaption: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  checklistCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundElevated,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  checkText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22,
  },
  scrollProof: {
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  scrollProofText: {
    color: colors.textFaint,
    fontSize: typography.caption,
  },
  sheetBackground: {
    backgroundColor: colors.backgroundElevated,
  },
  handleIndicator: {
    backgroundColor: colors.borderStrong,
    width: 48,
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  sheetMeta: {
    marginTop: spacing.xs,
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  sheetLabel: {
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  input: {
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: typography.body,
  },
  inputEcho: {
    minHeight: 20,
    marginTop: spacing.sm,
    color: colors.accent,
    fontSize: typography.caption,
  },
  sheetInstruction: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22,
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  scrollRowIndex: {
    width: 28,
    color: colors.accentWarm,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  scrollRowText: {
    color: colors.text,
    fontSize: typography.body,
  },
});
