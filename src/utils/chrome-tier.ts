export type ChromeTier = 'ios26' | 'iosLegacy' | 'android';

/**
 * Which navigation chrome the OS can draw for us.
 *
 * Kept free of any `react-native` import so the branch is directly testable —
 * `chromeTier` in `./chrome` is this function bound to the running platform.
 */
export function resolveChromeTier(os: string, version: string | number): ChromeTier {
  if (os !== 'ios') return 'android';

  // `Platform.Version` is a string like "26.0" on iOS, a number on Android.
  const major = Number.parseInt(String(version), 10);
  return Number.isFinite(major) && major >= 26 ? 'ios26' : 'iosLegacy';
}
