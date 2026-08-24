import { useEffect, useState } from 'react';
import {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Motion } from '@/theme';
import { Animated } from '@/tw/animated';

const OUT_FALLBACK = Motion.duration.base;

type Props = {
  visible: boolean;
  /** Fade-out window in ms: when the last block this covers finishes appearing. */
  out?: number;
  fill?: boolean;
  children: React.ReactNode;
};

/**
 * Cross-fades a skeleton out over the content replacing it.
 *
 * Unmounting the skeleton the moment `isLoading` flips leaves a frame of bare
 * canvas, because the content behind it starts at `opacity: 0` and staggers in
 * over several hundred ms.
 */
export function SkeletonFade({ visible, out = OUT_FALLBACK, fill = false, children }: Props) {
  const opacity = useSharedValue(visible ? 1 : 0);
  // Seeded from `visible`, not hardcoded: the first render differs by platform,
  // and `true` deadlocks Android — `visible === wasVisible` on mount, so the
  // adjust-during-render branch below never runs and no skeleton ever shows.
  const [gone, setGone] = useState(!visible);
  const [wasVisible, setWasVisible] = useState(visible);

  // Adjusting state during render — React's documented pattern for derived
  // state, and unlike an effect it reruns before committing.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setGone(false);
  }

  useEffect(() => {
    if (visible) {
      opacity.set(1);
      return;
    }
    opacity.set(
      withTiming(
        0,
        {
          duration: out,
          easing: Easing.linear,
          // Opacity only, nothing moves. Under `System` reduced motion would
          // snap it to 0 in one frame, reopening the gap this exists to close.
          reduceMotion: ReduceMotion.Never,
        },
        (done) => {
          'worklet';
          // `scheduleOnRN`, not `runOnJS` — the latter is deprecated in Reanimated 4.
          if (done) scheduleOnRN(setGone, true);
        },
      ),
    );
  }, [visible, out, opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  if (gone) return null;

  return (
    <Animated.View
      // Absolute only while fading: while visible it is the only thing giving
      // this block a height.
      className={
        visible
          ? fill
            ? 'flex-1'
            : undefined
          : fill
            ? 'absolute inset-0'
            : 'absolute inset-x-0 top-0'
      }
      pointerEvents="none"
      style={anim}
    >
      {children}
    </Animated.View>
  );
}
