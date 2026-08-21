import { File } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard } from 'react-native';
import { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAudioTranscriber } from '@/hooks/use-audio-transcriber';
import { SkeletonFade } from '@/components/skeleton-fade';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Colors, Motion, Space } from '@/theme';
import { Pressable, ScrollView, Text, View } from '@/tw';
import { cn } from '@/tw/cn';
import { chromeTier } from '@/utils/chrome';
import { filterGroups, groupDisorders } from '@/utils/disorders';

import { AndroidSearch } from './components/android-search';
import { BarReveal } from './components/bar-reveal';
import { BarScrim } from './components/bar-scrim';
import { ChipSkeleton, SKELETON_SPAN } from './components/chip-skeleton';
import { FindButton } from './components/find-button';
import { DisorderGroup } from './components/disorder-group';
import { FindFab } from './components/find-fab';
import { ScreenHeadline } from './components/screen-headline';

export const CHOOSE_TITLE = 'Topics';

export const CHOOSE_HEADLINE = 'Choose what fits';

export const CHOOSE_DESCRIPTION = 'From what you said. More than one is fine.';
const SEARCH_PLACEHOLDER = 'Search topics';
const MUTED = 'type-callout text-center text-ink';
const FAB_CLEARANCE = 56 + Space.base * 2;
const LEGACY_BAR_H = 44 + Space.sm * 2;

/**
 * Worst case: when the last chip of the last group finishes. After this the
 * stagger is switched off for good — see `revealed` below.
 */
const REVEAL_WINDOW =
  Motion.listStaggerMaxItems * Motion.listStagger +
  Motion.chipStaggerMaxItems * Motion.chipStagger +
  Motion.duration.base;

const SEARCH_PLACEMENT =
  chromeTier === 'ios26'
    ? { placement: 'integrated' as const, allowToolbarIntegration: true }
    : { placement: 'stacked' as const, hideWhenScrolling: false };

type Props = {
  audioUri: string | null;
};

export function ChooseScreen({ audioUri }: Props) {
  const { isLoading, data, error, processAudio } = useAudioTranscriber();
  const [readError, setReadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [attempt, setAttempt] = useState(0);
  const insets = useSafeAreaInsets();
  const [kbHeight, setKbHeight] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  const chipEntering = useCallback(
    (delayMs: number) =>
      (reduced ? FadeIn : FadeInDown).duration(Motion.duration.base).delay(delayMs),
    [reduced],
  );

  useEffect(() => {
    if (!audioUri) return;
    // No synchronous setState in an effect body — it cascades renders and React
    // Compiler rejects it here.
    let cancelled = false;
    (async () => {
      try {
        // The hook takes Blob | ArrayBuffer | Uint8Array and we hold a file
        // path. `expo-file-system.File` implements Blob, so reading an
        // ArrayBuffer meets the contract without a cast.
        const bytes = await new File(audioUri).arrayBuffer();
        if (cancelled) return;
        await processAudio(bytes);
      } catch {
        if (!cancelled) setReadError('We could not read that recording.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [audioUri, processAudio, attempt]);

  const retry = useCallback(() => {
    setReadError(null);
    setAttempt((n) => n + 1);
  }, []);

  const groups = useMemo(() => groupDisorders(data), [data]);
  const visible = useMemo(() => filterGroups(groups, query), [groups, query]);

  /**
   * Per-group selection signature, as a string rather than a `Set`.
   *
   * `selected` is a fresh `Set` after every tap, so passing it down changes the
   * props of EVERY group and re-renders all 49 chips — ~150 elements resolving
   * `className` again for a tap that changed one. Strings compare by value, so
   * React Compiler keeps the JSX of unchanged groups; the cost is one pass over
   * 49 items.
   */
  const groupKeys = useMemo(
    () =>
      visible.map((g) =>
        g.items
          .filter((i) => selected.has(i.value))
          .map((i) => i.value)
          .join(','),
      ),
    [visible, selected],
  );

  const toggle = useCallback((value: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    Haptics.selectionAsync().catch(() => {});
  }, []);

  // Carry the LABELS, not just the ids: `U_DIS_DEPRESSION` is shown as "Feeling
  // down", and deriving a label back from the id would print "Depression" — a
  // word the user never tapped that reads like a diagnosis.
  const picked = useMemo(() => {
    const ids = Array.from(selected);
    return ids.map((id) => ({
      id,
      label: data?.find((o) => o.value === id)?.label ?? '',
    }));
  }, [selected, data]);

  const openResults = useCallback(() => {
    if (picked.length === 0) return;
    router.push({
      pathname: '/results',
      params: {
        d: picked.map((p) => p.id).join(','),
        // Separated by `|`, not a comma: labels contain commas of their own
        // ("Stress, burnout") and would split into pieces.
        l: picked
          .map((p) => p.label)
          .filter(Boolean)
          .join('|'),
      },
    });
  }, [picked]);

  const pickedLabels = useMemo(() => picked.map((p) => p.label).filter(Boolean), [picked]);
  const legacyBarStyle = useMemo(
    () =>
      kbHeight > 0
        ? { bottom: kbHeight, paddingTop: Space.sm, paddingBottom: Space.sm }
        : { bottom: 0, paddingTop: Space.sm, paddingBottom: insets.bottom + Space.sm },
    [kbHeight, insets.bottom],
  );

  const failure = readError ?? error;
  const ready = Boolean(data) && !failure;
  const hasPicked = picked.length > 0;

  // Without this the Android FAB sits fully behind a full-size keyboard, and
  // scrolling cannot rescue it because the FAB is outside the scroll area.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) =>
      setKbHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // The stagger runs EXACTLY ONCE, when chips replace the skeleton. Tying it to
  // `visible` would replay it on every keystroke, since filtering remounts the
  // groups — motion the user meets dozens of times a session should not animate.
  useEffect(() => {
    if (!ready || revealed) return;
    const t = setTimeout(() => setRevealed(true), REVEAL_WINDOW);
    return () => clearTimeout(t);
  }, [ready, revealed]);

  // Bottom clearance. Only the hand-drawn bars (Android FAB, iOS < 26 bar) need
  // it: iOS 26 uses a native `Stack.Toolbar`, which the system folds into the
  // scroll view's content inset by itself.
  //
  // It goes into a spacer, not the ScrollView's `paddingBottom` — padding on the
  // scroll view itself clips content at the edge — and it is keyed off `ready`
  // rather than off FAB visibility, so the scroll range never jumps.
  const bottomPad = !ready
    ? Space.xl
    : chromeTier === 'android'
      ? FAB_CLEARANCE + insets.bottom + Space.base
      : chromeTier === 'iosLegacy'
        ? LEGACY_BAR_H + insets.bottom + Space.base
        : Space.xl;

  return (
    <>
      {/* The scroll view must be the FIRST child of the screen: `scrollEdgeEffects`
          only looks for a scroll view in the "first descendants chain of the
          Screen", so any view placed ahead of it kills the edge blur. That is
          also why the bottom bar sits AFTER it in the tree. It stays mounted in
          the loading and error states too — with a transparent header and no
          scroll view, content is stuck underneath the header for good. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        // `contentContainerClassName` ONLY. Passing `contentContainerStyle`
        // alongside it makes the explicit prop swallow the className-generated
        // style and `px-4` disappears. Bottom clearance goes through a spacer.
        contentContainerClassName="grow px-4"
        scrollIndicatorInsets={{ bottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <ScreenHeadline
          title={CHOOSE_HEADLINE}
          description={CHOOSE_DESCRIPTION}
          analysing={isLoading}
          settling
        />

        {chromeTier === 'android' ? (
          <View className="pb-1 pt-3">
            <AndroidSearch placeholder={SEARCH_PLACEHOLDER} onSearch={setQuery} />
          </View>
        ) : null}
        {failure ? (
          <Centered>
            <Text className="type-title text-center text-gentle">That did not come through</Text>
            <Text className={MUTED}>{failure}</Text>
            <Pressable className="mt-2 rounded-full border border-line px-6 py-3" onPress={retry}>
              <Text className="type-label text-ink">Try again</Text>
            </Pressable>
          </Centered>
        ) : (
          /* Skeleton and chips are NOT exclusive branches — they have to coexist
             briefly so one fades out while the other fades in. Swapping them in a
             single commit leaves at least one frame of bare canvas, because chips
             start at opacity 0 and the last group is delayed by 560ms. `relative`
             anchors the skeleton layer while it fades. */
          <View className="relative grow">
            {/* `!ready`, not just `!isLoading`: between mount and `processAudio`
                raising the loading flag there is a frame where both are false and
                `data` is still null, which would fall into "Nothing matches". */}
            {!ready ? null : visible.length === 0 ? (
              <Centered>
                <Text className={MUTED}>Nothing matches “{query.trim()}”.</Text>
              </Centered>
            ) : (
              <View className={cn('gap-8', chromeTier === 'android' ? 'pt-3' : 'pt-4')}>
                {visible.map((group, i) => (
                  <DisorderGroup
                    key={group.id}
                    group={group}
                    selectedKey={groupKeys[i]}
                    onToggle={toggle}
                    groupIndex={i}
                    entering={revealed ? null : chipEntering}
                  />
                ))}
              </View>
            )}

            <SkeletonFade visible={!ready} out={SKELETON_SPAN + Motion.duration.base}>
              <View className={chromeTier === 'android' ? 'pt-2' : 'pt-3'}>
                <ChipSkeleton status="Listening back…" />
              </View>
            </SkeletonFade>
          </View>
        )}
        <View style={{ height: bottomPad }} />
      </ScrollView>

      <Stack.Screen options={{ headerTitle: chromeTier === 'ios26' ? '' : CHOOSE_TITLE }} />

      {chromeTier !== 'android' ? (
        <Stack.SearchBar
          placeholder={SEARCH_PLACEHOLDER}
          onChangeText={(e) => setQuery(e.nativeEvent.text)}
          onClose={() => setQuery('')}
          autoCapitalize="none"
          tintColor={Colors.brand.default}
          textColor={Colors.text.primary}
          hintTextColor={Colors.text.placeholder}
          headerIconColor={Colors.text.primary}
          {...SEARCH_PLACEMENT}
        />
      ) : null}

      {chromeTier === 'ios26' ? (
        <Stack.Toolbar placement="bottom">
          {
            <>
              <Stack.Toolbar.SearchBarSlot />
              <Stack.Toolbar.Button
                variant="prominent"
                tintColor={Colors.brand.default}
                disabled={!ready || !hasPicked}
                accessibilityHint={
                  hasPicked
                    ? `Searching with ${pickedLabels.join(', ')}`
                    : 'Pick at least one topic'
                }
                onPress={openResults}
              >
                Find therapists
              </Stack.Toolbar.Button>
            </>
          }
        </Stack.Toolbar>
      ) : null}

      {ready && chromeTier === 'iosLegacy' ? (
        <View className="absolute inset-x-0 bg-canvas px-4" style={legacyBarStyle}>
          <BarScrim />
          <FindButton labels={pickedLabels} disabled={!hasPicked} onPress={openResults} />
        </View>
      ) : null}

      {ready && chromeTier === 'android' ? (
        <BarReveal
          shown={hasPicked}
          distance={FAB_CLEARANCE + insets.bottom}
          className="absolute right-4"
          style={
            kbHeight > 0
              ? { bottom: kbHeight + Space.base }
              : { bottom: insets.bottom + Space.base }
          }
        >
          <FindFab labels={pickedLabels} onPress={openResults} />
        </BarReveal>
      ) : null}
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View className="flex-1 items-center justify-center gap-3">{children}</View>;
}
