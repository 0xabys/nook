import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  Easing,
  ReduceMotion,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Colors, Motion } from '@/theme';

const BAR_COUNT = 56;
/**
 * The ripples need room: they start just outside the button (r=50) and dissolve
 * at r=138. The narrowest target screen is 393 minus `px-7` on both sides = 337,
 * so 300 still fits.
 */
const CANVAS = 300;
const CENTER = CANVAS / 2;
const INNER_R = 62;
const BAR_W = 3;
const MIN_H = 7;
const MAX_H = 30;

/**
 * Amplitude floor during silence. With height tied straight to metering, silence
 * — which an Android emulator always reports — collapses every bar to `MIN_H`
 * and the ring freezes, reading as a hang rather than as listening. 0.28 does not
 * lie about level: bars still rise clearly with sound, the floor just is not 0.
 */
const LEVEL_FLOOR = 0.28;

/** Crests travelling around the ring. 1 reads as a lighthouse, 3+ as noise. */
const LOBES = 2;
const SPIN_PERIOD = Motion.duration.breath * 2;

const RIPPLE_COUNT = 3;
const RIPPLE_R0 = 50;
const RIPPLE_R1 = 138;
const RIPPLE_OPACITY = 0.3;
const RIPPLE_PERIOD = Motion.duration.breath;

const IDLE_RING_R = 74;

type Props = {
  level: number;
  active: boolean;
  reducedMotion: boolean;
};

/**
 * The whole field around the record button: a static ring while idle, ripples and
 * a radial waveform while recording. Not a voice-memo bar.
 *
 * Motion here has TWO sources, deliberately kept apart. Bar height comes from the
 * microphone; the travelling crest and the ripples come from a clock. Driving
 * both from the mic means the screen freezes whenever the room is quiet.
 */
export function Waveform({ level, active, reducedMotion }: Props) {
  const smoothed = useSharedValue(0);
  // Two linear sawtooth clocks 0→1. All curvature lives in the cosine below —
  // easing the clock would bend different phases differently.
  const spin = useSharedValue(0);
  const ripple = useSharedValue(0);

  useEffect(() => {
    // `.set()`/`.get()`, not `.value` — React Compiler is on.
    smoothed.set(
      withTiming(active ? level : 0, {
        duration: reducedMotion ? 0 : 140,
      }),
    );
  }, [level, active, reducedMotion, smoothed]);

  useEffect(() => {
    if (!active || reducedMotion) {
      spin.set(0);
      ripple.set(0);
      return;
    }
    const loop = (period: number) =>
      withRepeat(
        withTiming(1, { duration: period, easing: Easing.linear }),
        -1,
        false,
        undefined,
        // Both `reduceMotion` flags — on `withTiming` and on `withRepeat` —
        // default to `System` and both have to be declared. `Never` is safe here
        // because the reduced-motion branch already returned above.
        ReduceMotion.Never,
      );
    spin.set(loop(SPIN_PERIOD));
    ripple.set(loop(RIPPLE_PERIOD));
  }, [active, reducedMotion, spin, ripple]);

  return (
    <Canvas style={{ position: 'absolute', width: CANVAS, height: CANVAS }}>
      {active ? null : (
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={IDLE_RING_R}
          style="stroke"
          strokeWidth={1}
          color={Colors.accent.coral}
          opacity={0.35}
        />
      )}

      {active && !reducedMotion
        ? Array.from({ length: RIPPLE_COUNT }, (_, i) => (
            <Ripple key={i} clock={ripple} index={i} />
          ))
        : null}

      {active ? (
        <Group>
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <Bar key={i} index={i} smoothed={smoothed} spin={spin} />
          ))}
        </Group>
      ) : null}
    </Canvas>
  );
}

function Ripple({ clock, index }: { clock: SharedValue<number>; index: number }) {
  const t = useDerivedValue(() => (clock.get() + index / RIPPLE_COUNT) % 1);
  const r = useDerivedValue(() => RIPPLE_R0 + (RIPPLE_R1 - RIPPLE_R0) * t.get());
  const opacity = useDerivedValue(() => RIPPLE_OPACITY * (1 - t.get()));

  return (
    <Circle
      cx={CENTER}
      cy={CENTER}
      r={r}
      style="stroke"
      strokeWidth={1.5}
      color={Colors.accent.coral}
      opacity={opacity}
    />
  );
}

function Bar({
  index,
  smoothed,
  spin,
}: {
  index: number;
  smoothed: SharedValue<number>;
  spin: SharedValue<number>;
}) {
  // Fixed per-position shape so the ring is not perfectly even, but COMPRESSED
  // into [0.6, 1.0]. At full range `shape` overpowers the travelling term and the
  // tallest bar JUMPS between fixed peaks instead of sweeping around — measured
  // as a crest stuck at 282° for six frames, then snapping to 147°.
  const shape =
    0.6 +
    0.4 * ((0.5 + 0.5 * Math.sin(index * 0.72)) * (0.55 + 0.45 * Math.sin(index * 0.21 + 1.1)));
  const angle = (index / BAR_COUNT) * 360;

  const amp = useDerivedValue(() => {
    // Travelling crest: each bar's phase is its angle minus the clock, so the
    // peak drifts clockwise. Range [0.3, 1.0] gives it — not `shape` — the final
    // say over which bar is tallest.
    const crest = 0.5 + 0.5 * Math.cos(2 * Math.PI * ((index / BAR_COUNT) * LOBES - spin.get()));
    const loud = LEVEL_FLOOR + (1 - LEVEL_FLOOR) * smoothed.get();
    return shape * loud * (0.3 + 0.7 * crest);
  });

  const height = useDerivedValue(() => MIN_H + MAX_H * amp.get());
  const y = useDerivedValue(() => CENTER - INNER_R - height.get());
  const opacity = useDerivedValue(() => 0.35 + 0.65 * amp.get());

  return (
    <Group
      transform={[{ rotate: (angle * Math.PI) / 180 }]}
      origin={vec(CENTER, CENTER)}
      opacity={opacity}
    >
      <RoundedRect x={CENTER - BAR_W / 2} y={y} width={BAR_W} height={height} r={BAR_W / 2}>
        <LinearGradient
          start={vec(0, CENTER - INNER_R - MAX_H)}
          end={vec(0, CENTER - INNER_R)}
          colors={[Colors.accent.coralSoft, Colors.accent.coral]}
        />
      </RoundedRect>
    </Group>
  );
}
