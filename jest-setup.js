/* global jest */

require('react-native-reanimated').setUpTests();

jest.mock('react-native-svg', () => require('react-native-reanimated/mock'));

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
