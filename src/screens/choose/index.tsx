import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ErrorState } from '@/components/error-state';
import { SkeletonFade } from '@/components/skeleton-fade';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useStaggerReveal } from '@/hooks/use-stagger-reveal';
import { Motion } from '@/theme';
import { ScrollView, Text, View } from '@/tw';
import { filterGroups, groupDisorders, selectionKeys } from '@/utils/disorders';
import { encodeList } from '@/utils/params';

import { ChipSkeleton, SKELETON_SPAN } from './components/chip-skeleton';
import { ChooseChrome, InlineSearch, useChooseBottomInset } from './components/choose-chrome';
import { DisorderGroup } from './components/disorder-group';
import { ScreenHeadline } from './components/screen-headline';
import { useTopicSelection } from './use-topic-selection';
import { useTranscription } from './use-transcription';

export const CHOOSE_TITLE = 'Topics';
export const CHOOSE_HEADLINE = 'Choose what fits';
export const CHOOSE_DESCRIPTION = 'From what you said. More than one is fine.';

const SEARCH_PLACEHOLDER = 'Search topics';

/**
 * Worst case for the entrance cascade: when the last chip of the last group
 * finishes. After this the stagger is switched off for good.
 */
const REVEAL_WINDOW =
  Motion.listStaggerMaxItems * Motion.listStagger +
  Motion.chipStaggerMaxItems * Motion.chipStagger +
  Motion.duration.base;

type Props = {
  audioUri: string | null;
};

export function ChooseScreen({ audioUri }: Props) {
  const { options, isLoading, failure, ready, retry } = useTranscription(audioUri);
  const { selected, toggle, ids, labels, hasPicked } = useTopicSelection(options);
  const [query, setQuery] = useState('');

  const reduced = useReducedMotion();
  const revealed = useStaggerReveal(ready, REVEAL_WINDOW);
  const bottomInset = useChooseBottomInset(ready);

  const groups = useMemo(() => groupDisorders(options), [options]);
  const visible = useMemo(() => filterGroups(groups, query), [groups, query]);
  const groupKeys = useMemo(() => selectionKeys(visible, selected), [visible, selected]);

  const chipEntering = useCallback(
    (delayMs: number) =>
      (reduced ? FadeIn : FadeInDown).duration(Motion.duration.base).delay(delayMs),
    [reduced],
  );

  const openResults = useCallback(() => {
    if (ids.length === 0) return;
    router.push({
      pathname: '/results',
      params: { d: encodeList(ids), l: encodeList(labels) },
    });
  }, [ids, labels]);

  return (
    <>
      {/* The scroll view must be the FIRST child of the screen: iOS resolves
          `scrollEdgeEffects` against the first descendants chain, so anything
          placed ahead of it kills the edge blur. It stays mounted through the
          loading and error states too — with a transparent header and no scroll
          view, content is stuck underneath the header for good. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        // `contentContainerClassName` ONLY. Passing `contentContainerStyle`
        // alongside it makes the explicit prop swallow the className-generated
        // style and `px-4` disappears. Bottom clearance goes through a spacer,
        // because padding on the scroll view itself clips content at the edge.
        contentContainerClassName="grow px-4"
        scrollIndicatorInsets={{ bottom: bottomInset }}
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

        <InlineSearch placeholder={SEARCH_PLACEHOLDER} onQueryChange={setQuery} />

        {failure ? (
          <Centered>
            <ErrorState
              title="That did not come through"
              body={failure.message}
              actionLabel={failure.recovery === 'record' ? 'Record again' : 'Try again'}
              onRetry={failure.recovery === 'record' ? router.back : retry}
            />
          </Centered>
        ) : (
          /* Skeleton and chips are NOT exclusive branches — they coexist briefly
             so one fades out while the other fades in. Swapping them in a single
             commit leaves at least one frame of bare canvas, because chips start
             at opacity 0 and the last group is delayed by 560ms. */
          <View className="relative grow">
            {ready ? (
              visible.length === 0 ? (
                <Centered>
                  <Text className="type-callout text-center text-ink">
                    Nothing matches “{query.trim()}”.
                  </Text>
                </Centered>
              ) : (
                <View className="gap-8 pt-4">
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
              )
            ) : null}

            <SkeletonFade visible={!ready} out={SKELETON_SPAN + Motion.duration.base}>
              <View className="pt-3">
                <ChipSkeleton status="Listening back…" />
              </View>
            </SkeletonFade>
          </View>
        )}

        <View style={{ height: bottomInset }} />
      </ScrollView>

      <ChooseChrome
        title={CHOOSE_TITLE}
        placeholder={SEARCH_PLACEHOLDER}
        onQueryChange={setQuery}
        ready={ready}
        hasPicked={hasPicked}
        labels={labels}
        onFind={openResults}
      />
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View className="flex-1 items-center justify-center gap-3">{children}</View>;
}
