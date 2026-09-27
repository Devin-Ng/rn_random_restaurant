/**
 * @format
 */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { NativeCompatibilityScreen } from '../src/dev/NativeCompatibilityScreen';

const mockSnapToIndex = jest.fn();
const mockClose = jest.fn();
const mockWithTiming = jest.fn<void, [number, unknown]>();

jest.mock('@gorhom/bottom-sheet', () => {
  const ReactModule = require('react');
  const ReactNative = require('react-native');
  const baseMock = require('@gorhom/bottom-sheet/mock');

  const MockBottomSheet = (props: {
    children?: React.ReactNode;
    ref?: React.Ref<unknown>;
  }) => {
    ReactModule.useImperativeHandle(props.ref, () => ({
      snapToIndex: mockSnapToIndex,
      close: mockClose,
    }));
    return ReactModule.createElement(
      ReactNative.View,
      { testID: 'mock-bottom-sheet' },
      props.children,
    );
  };

  const createHost = (name: string) =>
    ReactModule.forwardRef(
      (
        props: { children?: React.ReactNode },
        ref: React.ForwardedRef<unknown>,
      ) => ReactModule.createElement(name, { ...props, ref }, props.children),
    );

  return {
    ...baseMock,
    __esModule: true,
    BottomSheetScrollView: createHost('BottomSheetScrollView'),
    BottomSheetTextInput: createHost('BottomSheetTextInput'),
    default: MockBottomSheet,
  };
});

jest.mock('react-native-reanimated', () => {
  const ReactModule = require('react');
  const ReactNative = require('react-native');
  const AnimatedView = (props: React.ComponentProps<typeof ReactNative.View>) =>
    ReactModule.createElement(ReactNative.View, props, props.children);

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
    },
    ReduceMotion: {
      System: 'system',
      Always: 'always',
      Never: 'never',
    },
    useAnimatedStyle: (updater: () => unknown) => updater(),
    useReducedMotion: () => true,
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number, config: unknown) => {
      mockWithTiming(value, config);
      return value;
    },
  };
});

describe('NativeCompatibilityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the visible checklist, input, and both icon implementations', async () => {
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(<NativeCompatibilityScreen />);
    });

    const root = renderer!.root;
    expect(
      root.findByProps({ testID: 'reduced-motion-status' }).props.children,
    ).toBe('Enabled');
    expect(root.findByProps({ testID: 'lucide-keyboard-icon' })).toBeDefined();
    expect(root.findByProps({ testID: 'direct-svg-icon' })).toBeDefined();
    expect(root.findByProps({ testID: 'native-sheet-input' })).toBeDefined();
    expect(
      root.findByProps({ testID: 'native-compatibility-title' }).props.children,
    ).toBe('Native compatibility lab');
    expect(
      root.findAllByProps({ testID: 'native-sheet-scroll' }).length,
    ).toBeGreaterThan(0);
  });

  it('wires explicit sheet open and close controls', async () => {
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(<NativeCompatibilityScreen />);
    });

    act(() => {
      renderer!.root
        .findByProps({ testID: 'open-native-sheet' })
        .props.onPress();
      renderer!.root
        .findByProps({ testID: 'close-native-sheet' })
        .props.onPress();
    });

    expect(mockSnapToIndex).toHaveBeenCalledWith(0);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('echoes keyboard input and requests system-aware motion', async () => {
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(<NativeCompatibilityScreen />);
    });

    act(() => {
      renderer!.root
        .findByProps({ testID: 'native-sheet-input' })
        .props.onChangeText('dim sum');
      renderer!.root
        .findByProps({ testID: 'run-motion-check' })
        .props.onPress();
    });

    expect(
      renderer!.root.findByProps({ testID: 'native-sheet-input-echo' }).props
        .children,
    ).toBe('Input value: dim sum');
    expect(mockWithTiming).toHaveBeenCalledWith(
      48,
      expect.objectContaining({ reduceMotion: 'system' }),
    );
  });
});
