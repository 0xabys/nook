import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Motion } from '@/theme';
import { Animated } from '@/tw/animated';

type Props = {
  shown: boolean;
  distance: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * Wraps the bottom bar so it NEVER mounts or unmounts.
 *
 * `shown ? <Bar/> : null` is not a rough animation, it is no animation: React
 * attaches or detaches the node and RN paints it in one frame. Here the node
 * always lives and a single shared value runs 0 → 1, so rapid select/deselect
 * reverses mid-flight instead of queueing.
 *
 * The price is an invisible node in the tree. It is locked out of both touch
 * (`pointerEvents`) and accessibility — miss either and an invisible button
 * eats taps or shows up in the screen reader.
 */
export function BarReveal({ shown, distance, className, style, children }: Props) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(shown ? 1 : 0);

  useEffect(() => {
    // 180ms `withTiming` + strong ease-out, NOT `withSpring`. `Motion.spring` is
    // critically damped (ζ≈0.93, ω≈11.8 rad/s): it needs ~410ms to reach 95% and
    // starts from zero velocity, covering only ~15% in the first 100ms, which
    // reads as "the button appeared a while after I tapped". A front-loaded curve
    // is nearly at full opacity by 60ms.
    //
    // `.set()`/`.get()`, not `.value` — React Compiler is on.
    progress.set(
      withTiming(shown ? 1 : 0, {
        duration: Motion.duration.fast,
        easing: Easing.bezier(...Motion.easeOut),
      }),
    );
  }, [shown, progress]);

  const anim = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * (reduced ? 0 : distance) }],
  }));

  return (
    <Animated.View
      pointerEvents={shown ? 'auto' : 'none'}
      accessibilityElementsHidden={!shown}
      importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
      className={className}
      style={[style, anim]}
    >
      {children}
    </Animated.View>
  );
}
