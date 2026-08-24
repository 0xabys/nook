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
 * Reveals the bottom bar without ever mounting or unmounting it, so rapid
 * select/deselect reverses mid-flight instead of popping.
 *
 * The node always exists, so it must be locked out of both touch and
 * accessibility while hidden — miss either and an invisible button eats taps.
 */
export function BarReveal({ shown, distance, className, style, children }: Props) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(shown ? 1 : 0);

  useEffect(() => {
    // Front-loaded timing, not `Motion.spring`: the spring is critically damped
    // and covers only ~15% in the first 100ms, which reads as a delayed button.
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
