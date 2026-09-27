import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      {__DEV__ ? (
        <TouchableOpacity
          accessibilityHint="Opens the native dependency compatibility screen"
          accessibilityLabel="Open native compatibility check"
          accessibilityRole="button"
          onPress={() => navigation.navigate('NativeCompatibility')}
          style={styles.devButton}
          testID="native-compatibility-entry"
        >
          <Text style={styles.devButtonText}>Native check</Text>
        </TouchableOpacity>
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
  devButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    backgroundColor: colors.overlay,
  },
  devButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
