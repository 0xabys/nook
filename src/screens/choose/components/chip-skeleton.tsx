import type { SharedValue } from 'react-native-reanimated';

import { usePulseClock, usePulseStyle } from '@/hooks/use-pulse';
import { Motion } from '@/theme';
import { Text, View } from '@/tw';
import { Animated } from '@/tw/animated';

const GROUPS: number[][] = [
  [30, 46, 28, 17, 19, 37, 42],
  [34, 52, 40, 20, 30, 24],
  [26, 55, 33, 30, 44],
];

const CHIP = 'h-10 rounded-full border border-line bg-surface';

/**
 * TOP PADDING: the skeleton block uses `pt-3` (`pt-2` on Android), 4pt LESS than
 * the chip block, because the status line replaces the first group heading and
 * `type-caption` is 18 tall against `type-overline`'s 14:
 *
 *   chips    `pt-4`(16) + heading(14) + `gap-3`(12) = 42
 *   skeleton `pt-3`(12) + status(18)  + `gap-3`(12) = 42
 *
 * Do not "fix" it by forcing `h-3.5` onto the `Text`: RN clips the overflow and
 * the descender of "Listening back…" gets cut.
 */

/**
 * When the LAST real chip under this skeleton starts appearing. `SkeletonFade`
 * uses it to size the cover's lifetime. Derived from `GROUPS` rather than typed
 * by hand, so editing `GROUPS` moves the window with it.
 */
export const SKELETON_SPAN =
  (GROUPS.length - 1) * Motion.listStagger +
  (Math.max(...GROUPS.map((g) => g.length)) - 1) * Motion.chipStagger;

type Props = {
  status: string;
};

export function ChipSkeleton({ status }: Props) {
  const clock = usePulseClock();
  // The index runs CONTINUOUSLY across the whole list, headings included.
  // Resetting per group chops the wave up and loses its direction.
  let n = 0;

  return (
    <View
      className="gap-8"
      // The whole block is placeholder art with nothing to announce.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {GROUPS.map((widths, g) => (
        <View key={g} className="gap-3">
          {/* The FIRST group carries the status line, the rest a placeholder bar —
              one slot, two contents; see the `status` prop.
              `canvas-strong`, NOT `sunken`: `grey-200` exists for use inside the
              white cards on Results and differs from the sage canvas by 5/255,
              i.e. not at all. */}
          {g === 0 ? (
            // Do NOT clamp this to 14 to match the heading slot: `type-caption` is
            // 18 and clamping cuts the descender of "Listening back…". The 4pt is
            // compensated in the block's top padding instead.
            <Pulse clock={clock} index={n++}>
              <Text className="type-caption text-ink-soft">{status}</Text>
            </Pulse>
          ) : (
            <Pulse clock={clock} index={n++} className="h-3.5 w-2/5 rounded-xs bg-canvas-strong" />
          )}
          <View className="flex-row flex-wrap gap-2">
            {widths.map((w, i) => (
              <Pulse key={i} clock={clock} index={n++} className={CHIP} width={w} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * One placeholder block, deriving its own opacity from the shared clock by
 * `index`. Same shape as `Bar` in the record waveform: the `SharedValue` goes
 * down as a prop, React never re-renders, everything runs on the UI thread.
 */
function Pulse({
  clock,
  index,
  className,
  width,
  children,
}: {
  clock: SharedValue<number>;
  index: number;
  className?: string;
  width?: number;
  children?: React.ReactNode;
}) {
  const anim = usePulseStyle(clock, index);
  return (
    <Animated.View
      className={className}
      style={[anim, width == null ? null : { width: `${width}%` }]}
    >
      {children}
    </Animated.View>
  );
}
