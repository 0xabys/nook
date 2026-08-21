import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { useRecorder } from '@/hooks/use-recorder';
import { formatDuration } from '@/utils/duration';
import { Colors } from '@/theme';
import { Pressable, SafeAreaView, Text, View } from '@/tw';

import { RecordButton } from './components/record-button';

const RECOVER = 'press mb-8 self-center rounded-full border border-on-deep-veil px-6 py-3';

/**
 * How long to wait after `router.push` before dropping the recorder back to
 * `idle`. The button draws a STOP square while the phase is not `idle`, so
 * resetting early flips the icon back to a mic WHILE the record screen is still
 * fully visible.
 *
 * Navigation events do not work here: `blur` fires when `router.push` starts,
 * before the native transition moves at all, and `focus` fires after it has
 * finished. Neither lands while the screen is covered.
 *
 * 900 is measured. Push → the new screen starting to slide is 122–148ms on iOS
 * and 169–344ms on Android; plus the transition itself (~350ms / ~300ms) the
 * screen is fully covered around 500ms and 650ms. Erring late is harmless —
 * nobody sees it — while erring early is the actual bug.
 */
const SETTLE_MS = 900;

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
              <Text className="type-caption text-on-deep-faint">{hintFor(phase)}</Text>
            </View>
          </View>

          {phase === 'denied' ? (
            <Pressable className={RECOVER} onPress={() => Linking.openSettings()}>
              <Text className="type-label text-on-deep">Open Settings</Text>
            </Pressable>
          ) : phase === 'tooShort' ? (
            <Pressable className={RECOVER} onPress={reset}>
              <Text className="type-label text-on-deep">Try again</Text>
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

function hintFor(phase: string): string {
  switch (phase) {
    case 'recording':
      return 'Tap to stop';
    case 'processing':
      return 'Listening back…';
    case 'denied':
      return 'Nook needs the microphone to hear you';
    case 'tooShort':
      return 'That was very short. Say a little more?';
    default:
      return 'Tap to start';
  }
}

function LockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
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
