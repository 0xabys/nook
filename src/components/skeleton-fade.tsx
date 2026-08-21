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

/**
 * The cover has to live exactly as long as the layer underneath needs to finish
 * appearing, so each screen declares its own `out`.
 *
 * `linear`, not ease-out: this is not an element entering or leaving the screen,
 * it is a mask bridging two states. Only two complementary curves keep the total
 * ink flat — front-loading one side digs a trough in the other.
 */
const OUT_FALLBACK = Motion.duration.base;

type Props = {
  visible: boolean;
  /**
   * Fade-out window in ms. Must match when the LAST real block covered by this
   * skeleton finishes appearing, taken from that screen's stagger scale.
   */
  out?: number;
  fill?: boolean;
  children: React.ReactNode;
};

/**
 * A skeleton has to FADE, not disappear. Unmounting it the moment `isLoading`
 * flips leaves at least one frame of bare canvas, because the content replacing
 * it starts at `opacity: 0` and staggers in over several hundred ms.
 *
 * The skeleton goes ABSOLUTE as soon as it starts fading, releasing its space in
 * the layout flow: the real content lands in its final position on the first
 * frame while the skeleton is just a layer on top going transparent.
 *
 * The node unmounts once the fade completes — unlike `BarReveal`, this one never
 * comes back within a screen's lifetime.
 */
export function SkeletonFade({ visible, out = OUT_FALLBACK, fill = false, children }: Props) {
  const opacity = useSharedValue(visible ? 1 : 0);
  // `!visible`, and both platforms have bitten here once.
  //
  // The first render differs by platform because `processAudio` runs after an
  // await that reads the file: on iOS `isLoading` is still `false` on the first
  // render, on Android it is already `true`. Hardcoding `true` deadlocks
  // Android (`visible === wasVisible`, so the adjust-during-render branch never
  // runs and no skeleton shows for the full 2s). `!visible` serves both.
  const [gone, setGone] = useState(!visible);
  const [wasVisible, setWasVisible] = useState(visible);

  // Adjusting state DURING render on a prop change — React's documented pattern
  // for derived state. Unlike a `setState` in an effect body, React discards the
  // in-progress render and reruns before committing.
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
          // `Never`: under `System`, reduced motion snaps opacity to 0 and the
          // cover vanishes in one frame — reopening the exact gap this file
          // exists to close, for the users who need it most. Nothing slides or
          // scales here, only opacity.
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
      // Absolute only while FADING. While visible it must stay in flow — it is
      // the only thing giving this block a height.
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
