import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { useRecorder, type RecorderPhase } from '@/hooks/use-recorder';
import { Colors } from '@/theme';
import { Pressable, SafeAreaView, Text, View } from '@/tw';
import { formatDuration } from '@/utils/duration';

import { RecordButton } from './components/record-button';

const RECOVER = 'press mb-8 self-center rounded-full border border-on-deep-veil px-6 py-3';

/**
 * How long to wait after `router.push` before dropping the recorder back to
 * `idle`. The button draws a STOP square while the phase is not `idle`, so
 * resetting early flips the icon back to a mic while the record screen is still
 * fully visible.
 *
 * Navigation events do not help: `blur` fires when `router.push` starts, before
 * the native transition moves at all, and `focus` fires after it has finished.
 * Neither lands while the screen is covered. Erring late is invisible; erring
 * early is the actual bug.
 */
const SETTLE_MS = 900;

const HINTS: Record<RecorderPhase, string> = {
  idle: 'Tap to start',
  recording: 'Tap to stop',
  processing: 'Listening back…',
  denied: 'Nook needs the microphone to hear you',
  tooShort: 'That was very short. Say a little more?',
  failed: 'Something got in the way of the microphone',
};

type Recovery = { label: string; onPress: () => void };

function recoveryFor(phase: RecorderPhase, reset: () => void): Recovery | null {
  switch (phase) {
    case 'denied':
      return { label: 'Open Settings', onPress: () => Linking.openSettings() };
    case 'tooShort':
    case 'failed':
      return { label: 'Try again', onPress: reset };
    default:
      return null;
  }
}

export function RecordScreen() {
  const { phase, level, durationMs, start, stop, reset } = useRecorder();

  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current);
    },
    [],
  );

  const onPress = async () => {
    if (phase === 'recording') {
      const uri = await stop();
      if (!uri) return;
      router.push({ pathname: '/choose', params: { audio: uri } });
      // The STOP square stays until the screen is covered — see `SETTLE_MS`.
      settle.current = setTimeout(reset, SETTLE_MS);
      return;
    }
    await start();
  };

  const recovery = recoveryFor(phase, reset);

  return (
    <View className="flex-1 bg-deep">
      {/* Horizontal padding lives on the CHILD View, not on `SafeAreaView`.
          `RNCSafeAreaView` reads padding Left/Right/Horizontal/All and overwrites
          them with the safe-area inset, so the `padding-inline` Tailwind emits
          for `px-*` is swallowed and text ends up clipped at the left edge. */}
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-7">
          <View className="gap-3 pt-12">
            <Text className="type-display text-on-deep">Tell me what&apos;s going on.</Text>
            <Text className="type-callout max-w-[280px] text-on-deep-muted">
              Take your time. There&apos;s no form to fill in and nothing to sign up for.
            </Text>
          </View>

          <View className="flex-1 items-center justify-center">
            <RecordButton phase={phase} level={level} onPress={onPress} />

            <View className="mt-4 h-[46px] items-center gap-2">
              {phase === 'recording' ? (
                <Text
                  className="type-callout text-on-deep-muted"
                  // react-native-css does not map font-variant-numeric, so the
                  // clock has to declare tabular-nums through style.
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatDuration(durationMs)}
                </Text>
              ) : null}
              <Text className="type-caption text-on-deep-faint">{HINTS[phase]}</Text>
            </View>
          </View>

          {recovery ? (
            <Pressable className={RECOVER} accessibilityRole="button" onPress={recovery.onPress}>
              <Text className="type-label text-on-deep">{recovery.label}</Text>
            </Pressable>
          ) : (
            <View className="flex-row items-center justify-center gap-2 pb-8">
              <LockIcon />
              <Text className="type-caption text-on-deep-faint">
                Your recording stays on this device
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function LockIcon() {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Rect
        x={4}
        y={10.5}
        width={16}
        height={10}
        rx={2.5}
        stroke={Colors.textOnDeep.faint}
        strokeWidth={1.6}
      />
      <Path
        d="M8 10.5V7a4 4 0 0 1 8 0v3.5"
        stroke={Colors.textOnDeep.faint}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
