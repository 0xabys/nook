import { useEffect } from 'react';
import {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Motion } from '@/theme';

import { useReducedMotion } from './use-reduced-motion';

/**
 * Floor of the pulse; DESIGN.md `### Skeleton` specifies opacity 0.6 → 1.0 over
 * 1200ms. Reduced motion makes it SHALLOWER, not still — an opacity change does
 * not trigger vestibular symptoms, and killing it entirely would take away the
 * only signal that work is still in progress.
 */
const DIM = 0.6;
const DIM_REDUCED = 0.85;

/**
 * Phase offset per block, as a fraction of one cycle. A skeleton list holds ~21
 * blocks; 21 × 0.025 ≈ half a wave on screen at any moment — enough to read a
 * direction, not enough to look like stripes.
 */
export const PHASE_STEP = 0.025;

/** Full cycle. `Motion.duration.pulse` is a HALF cycle. */
const PERIOD = Motion.duration.pulse * 2;

/**
 * Sawtooth clock 0 → 1, looping forever, LINEAR. Linear is required: all of the
 * curve lives in the cosine inside `usePulseStyle`, and easing here would bend
 * two out-of-phase blocks differently and warp the wave.
 */
export function usePulseClock(active = true) {
  const clock = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      clock.set(0);
      return;
    }
    clock.set(
      withRepeat(
        withTiming(1, {
          duration: PERIOD,
          easing: Easing.linear,
          // `Never` is not an accessibility bypass. Under the `System` default
          // Reanimated makes `withTiming` jump straight to the target, freezing
          // the clock at 1 and locking opacity at 1.0. The concession is made in
          // amplitude instead: `DIM` 0.6 becomes `DIM_REDUCED` 0.85.
          reduceMotion: ReduceMotion.Never,
        }),
        -1,
        false,
        undefined,
        // `withRepeat` carries its OWN `reduceMotion` flag, also defaulting to
        // `System`. Setting it on the inner animation alone is not enough — the
        // repeat wrapper still gets disabled and the clock runs exactly once.
        ReduceMotion.Never,
      ),
    );
  }, [active, clock]);

  return clock;
}

export function usePulseStyle(clock: SharedValue<number>, index = 0) {
  const reduced = useReducedMotion();
  const dim = reduced ? DIM_REDUCED : DIM;
  // Reduced motion drops the DIRECTION: every block shares a phase.
  const phase = reduced ? 0 : index * PHASE_STEP;

  return useAnimatedStyle(() => {
    const wave = 0.5 + 0.5 * Math.cos(2 * Math.PI * (clock.get() - phase));
    return { opacity: dim + (1 - dim) * wave };
  });
}

export function usePulse(active = true) {
  const clock = usePulseClock(active);
  return usePulseStyle(clock, 0);
}
