import { Platform } from 'react-native';

export type ChromeTier = 'ios26' | 'iosLegacy' | 'android';

function detect(): ChromeTier {
  if (Platform.OS !== 'ios') return 'android';
  // Platform.Version is a string like "26.0" on iOS.
  const major = Number.parseInt(String(Platform.Version), 10);
  return Number.isFinite(major) && major >= 26 ? 'ios26' : 'iosLegacy';
}

export const chromeTier = detect();
