import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Whether Liquid Glass should be used — two questions, not one.
 * `isLiquidGlassAvailable()` only reports whether the component exists; it still
 * returns true when the user has turned on Reduce Transparency.
 */
export function useLiquidGlass(): boolean {
  const [glass, setGlass] = useState(false);

  useEffect(() => {
    if (!isLiquidGlassAvailable()) return;
    // Async IIFE + cancel flag: a synchronous setState in an effect body is
    // rejected by `react-hooks/set-state-in-effect`.
    let cancelled = false;
    (async () => {
      const reduced = await AccessibilityInfo.isReduceTransparencyEnabled();
      if (!cancelled) setGlass(!reduced);
    })();

    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', (reduced) => {
      setGlass(!reduced);
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return glass;
}
