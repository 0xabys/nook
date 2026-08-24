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
 * Pulse floor: opacity 0.6 → 1.0 over 1200ms, per DESIGN.md `### Skeleton`.
 * Reduced motion makes it shallower rather than still — opacity does not trigger
 * vestibular symptoms, and stopping it removes the only "still working" signal.
 */
const DIM = 0.6;
const DIM_REDUCED = 0.85;

/** Phase offset per block, as a fraction of a cycle: ~half a wave over ~21 blocks. */
export const PHASE_STEP = 0.025;

/** Full cycle. `Motion.duration.pulse` is a HALF cycle. */
const PERIOD = Motion.duration.pulse * 2;

/**
 * Sawtooth clock 0 → 1, looping forever. Linear is required: the curve lives in
 * the cosine in `usePulseStyle`, and easing here would warp out-of-phase blocks.
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
          // Not a bypass: under `System` the clock would freeze at 1 and lock
          // opacity solid. The concession is made in amplitude, via `DIM_REDUCED`.
          reduceMotion: ReduceMotion.Never,
        }),
        -1,
        false,
        undefined,
        // `withRepeat` carries its own flag; setting only the inner one leaves
        // the wrapper disabled and the clock runs exactly once.
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
