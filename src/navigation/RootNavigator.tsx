import {
  DarkTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { DetailScreen } from '../screens/DetailScreen';
import { FilterScreen } from '../screens/FilterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PickScreen } from '../screens/PickScreen';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

const NativeCompatibilityScreen = __DEV__
  ? require('../dev/NativeCompatibilityScreen').NativeCompatibilityScreen
  : undefined;

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.backgroundElevated,
    text: colors.text,
    primary: colors.accent,
    border: colors.border,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          headerTransparent: true,
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Filters"
          component={FilterScreen}
          options={{ headerShown: true, title: '' }}
        />
        <Stack.Screen name="Pick" component={PickScreen} />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ headerShown: true, title: '' }}
        />
        {__DEV__ && NativeCompatibilityScreen ? (
          <Stack.Screen
            name="NativeCompatibility"
            component={NativeCompatibilityScreen}
            options={{
              headerShown: true,
              headerTransparent: false,
              title: 'Native compatibility',
            }}
          />
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
