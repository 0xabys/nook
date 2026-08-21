import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { usePulse } from '@/hooks/use-pulse';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Colors, Motion } from '@/theme';
import { Animated } from '@/tw/animated';

const BARS = [7, 12, 4, 15, 9, 16, 6, 11, 5];

/**
 * Starting size of the echo: 26×16 grows to 42×26. No larger — only `gap-3`
 * (12pt) separates the glyph from the title, and past 1.6 it collides with the
 * text. Never from 0 either; nothing appears out of nothing.
 */
const ECHO_SCALE = 1.6;

/**
 * Delay before the echo starts. An iOS native-stack push takes about 350ms;
 * firing on mount pits the echo against the screen slide and both lose.
 */
const ECHO_DELAY = 300;

type Props = {
  width?: number;
  height?: number;
  animating?: boolean;
  settling?: boolean;
};

export function Voiceprint({
  width = 26,
  height = 16,
  animating = false,
  settling = false,
}: Props) {
  const anim = usePulse(animating);

  const reduced = useReducedMotion();
  // 1 = at final size.
  const settle = useSharedValue(settling && !reduced ? 0 : 1);
  const appear = useSharedValue(settling ? 0 : 1);

  useEffect(() => {
    if (!settling) return;
    if (reduced) {
      appear.set(withTiming(1, { duration: Motion.duration.fast }));
      return;
    }
    settle.set(withDelay(ECHO_DELAY, withSpring(1, Motion.spring)));
    appear.set(withDelay(ECHO_DELAY, withTiming(1, { duration: Motion.duration.base })));
  }, [settling, reduced, settle, appear]);

  const echo = useAnimatedStyle(() => ({
    opacity: appear.get(),
    transform: [{ scale: ECHO_SCALE - (ECHO_SCALE - 1) * settle.get() }],
  }));

  const barW = 2;
  const gap = (width - BARS.length * barW) / (BARS.length - 1);

  return (
    // Two NESTED layers, not one merged style array: both write `opacity`, and
    // in an array the later one wins and the pulse disappears. Nesting
    // multiplies them, which is what we want.
    <Animated.View style={echo}>
      <Animated.View style={anim}>
        <Svg
          width={width}
          height={height}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {BARS.map((h, i) => {
            const scaled = (h / 16) * height;
            return (
              <Rect
                key={i}
                x={i * (barW + gap)}
                y={(height - scaled) / 2}
                width={barW}
                height={scaled}
                rx={barW / 2}
                fill={Colors.accent.coral}
                opacity={0.45 + 0.55 * (h / 16)}
              />
            );
          })}
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
