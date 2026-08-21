import { router, Stack } from 'expo-router';
import { useCallback } from 'react';
import { FadeIn, FadeInDown } from 'react-native-reanimated';

import type { Provider } from '@/api/types';
import { useProviders } from '@/api/use-providers';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ProviderCard } from '@/components/provider-card';
import { SkeletonCard } from '@/components/skeleton-card';
import { SkeletonFade } from '@/components/skeleton-fade';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Colors, Motion } from '@/theme';
import { chromeTier } from '@/utils/chrome';
import { ActivityIndicator, FlatList, ScrollView, Text, View } from '@/tw';
import { Animated } from '@/tw/animated';

import { ResultsHeader } from './components/results-header';

const SKELETON_COUNT = 5;

/** Fade window: when the 5th real card — the last one covered — finishes. */
const SKELETON_SPAN = (SKELETON_COUNT - 1) * Motion.listStagger + Motion.duration.base;

export const RESULTS_TITLE = 'Therapists';

const LIST_CONTENT = 'px-4 pb-6';

type Props = {
  disorderIds: string[];
  disorderLabels: string[];
};

export function ResultsScreen({ disorderIds, disorderLabels }: Props) {
  const {
    providers,
    totalSize,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useProviders(disorderIds);
  const reduced = useReducedMotion();

  const renderItem = useCallback(
    ({ item, index }: { item: Provider; index: number }) => {
      // 40ms per item, stopping after the 8th — past that the user is scrolling,
      // not watching the list arrive. Reduced motion fades only.
      const entering = reduced
        ? FadeIn.duration(Motion.duration.base)
        : FadeInDown.duration(Motion.duration.base).delay(
            Math.min(index, Motion.listStaggerMaxItems) * Motion.listStagger,
          );
      return (
        <Animated.View entering={entering}>
          <ProviderCard provider={item} />
        </Animated.View>
      );
    },
    [reduced],
  );

  let body;
  if (isError) {
    body = (
      <Centered>
        <ErrorState
          title="We could not load therapists."
          body="The connection dropped somewhere between here and Aepsy. Nothing you did."
          onRetry={() => refetch()}
        />
      </Centered>
    );
  } else if (!isLoading && providers.length === 0) {
    body = (
      <Centered>
        <EmptyState
          title="No one is taking clients right now."
          body="This can change through the week. You can go back and adjust what you picked."
          actionLabel="Change topics"
          onAction={() => router.back()}
        />
      </Centered>
    );
  } else {
    body = (
      <FlatList
        // `flex-1` is REQUIRED now that a skeleton layers over this: without it
        // the list hugs its content and the cover lands BELOW it instead of on
        // top, showing two stacked headers.
        className="flex-1"
        data={providers}
        keyExtractor={(p) => p.userInfo.firebaseUid}
        renderItem={renderItem}
        // `null`, NOT `totalSize`, while loading: before the query lands
        // `totalSize` is 0 and the header would read "0 therapists taking
        // clients". `null` matches the copy the cover is showing, so the two
        // layers coincide and the header holds still through the handover.
        ListHeaderComponent={
          <ResultsHeader labels={disorderLabels} total={isLoading ? null : totalSize} />
        }
        ItemSeparatorComponent={Separator}
        ListFooterComponent={
          <Footer loading={isFetchingNextPage} done={!hasNextPage} count={providers.length} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName={LIST_CONTENT}
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: chromeTier === 'android' ? RESULTS_TITLE : '' }} />
      {/* Skeleton and real list must COEXIST through the handover, same as on
          Choose. While loading, `providers` is empty so the `FlatList` below
          renders only `ResultsHeader` — identical to the one in the skeleton
          layer, same `total={null}`, same position — so the overlap reads as one
          header holding still while only the cards change. */}
      <View className="relative flex-1">
        {body}
        <SkeletonFade visible={isLoading} out={SKELETON_SPAN} fill>
          <ScrollView
            className="flex-1"
            contentInsetAdjustmentBehavior="automatic"
            contentContainerClassName={LIST_CONTENT}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {/* This header is INVISIBLE — it only reserves space. The list below
                already renders the real one, and showing both would overlay two
                different strings mid-fade. It stays a real component rather than
                a hardcoded height, because whether the labels wrap depends on how
                many topics the user picked. */}
            <View className="opacity-0" accessibilityElementsHidden>
              <ResultsHeader labels={disorderLabels} total={null} />
            </View>
            <View className="gap-3">
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </View>
          </ScrollView>
        </SkeletonFade>
      </View>
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      className="flex-1"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="grow items-center justify-center px-4"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

function Separator() {
  return <View className="h-3" />;
}

function Footer({ loading, done, count }: { loading: boolean; done: boolean; count: number }) {
  if (loading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={Colors.text.placeholder} />
      </View>
    );
  }
  // Only claim the end when the list was long enough to have been scrolled.
  if (done && count > SKELETON_COUNT) {
    return (
      <View className="items-center py-6">
        <Text className="type-caption text-center text-ink-soft">
          That is everyone taking clients right now.
        </Text>
      </View>
    );
  }
  return <View className="h-6" />;
}
