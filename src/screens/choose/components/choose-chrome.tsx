import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { Colors, Space } from '@/theme';
import { View } from '@/tw';
import { chromeTier } from '@/utils/chrome';

import { AndroidSearch } from './android-search';
import { BarReveal } from './bar-reveal';
import { BarScrim } from './bar-scrim';
import { FindButton } from './find-button';
import { FindFab } from './find-fab';

/** Android FAB height plus the gap above and below it. */
const FAB_CLEARANCE = 56 + Space.base * 2;

/** iOS < 26 bottom bar: a 44pt button plus its padding. */
const LEGACY_BAR_H = 44 + Space.sm * 2;

const SEARCH_PLACEMENT =
  chromeTier === 'ios26'
    ? { placement: 'integrated' as const, allowToolbarIntegration: true }
    : // Must be explicit: UIKit's `hidesSearchBarWhenScrolling` defaults to YES,
      // so omitting the prop hides the field rather than leaving it alone.
      { placement: 'stacked' as const, hideWhenScrolling: false };

/**
 * Bottom clearance for the scroll content.
 *
 * Only the hand-drawn bars need it. iOS 26 uses a native `Stack.Toolbar`, which
 * the system folds into the scroll view's content inset by itself. Keyed off
 * `ready` rather than off whether the action is showing, so the scroll range
 * never jumps under the user.
 */
export function useChooseBottomInset(ready: boolean): number {
  const insets = useSafeAreaInsets();

  if (!ready) return Space.xl;
  if (chromeTier === 'android') return FAB_CLEARANCE + insets.bottom + Space.base;
  if (chromeTier === 'iosLegacy') return LEGACY_BAR_H + insets.bottom + Space.base;
  return Space.xl;
}

/**
 * The search field on Android only, as the first row of scrolling content.
 *
 * `Stack.SearchBar` is not an option here: RNScreens renders it with
 * `androidx.appcompat.widget.SearchView`, a Material 1 widget that looks
 * nothing like the rest of the app. Returns null everywhere else, where the
 * field belongs to the navigation bar instead.
 */
export function InlineSearch({ placeholder, onQueryChange }: SearchProps) {
  if (chromeTier !== 'android') return null;

  return (
    <View className="pt-3">
      <AndroidSearch placeholder={placeholder} onSearch={onQueryChange} />
    </View>
  );
}

type SearchProps = {
  placeholder: string;
  onQueryChange: (query: string) => void;
};

type Props = SearchProps & {
  title: string;
  ready: boolean;
  hasPicked: boolean;
  labels: string[];
  onFind: () => void;
};

/**
 * Search field and primary action, in whichever form the OS can draw natively.
 *
 * Three tiers, one contract — the screen states what it needs and never asks
 * which platform it is on. Must render AFTER the scroll view: iOS resolves
 * `scrollEdgeEffects` against the first descendants chain of the screen, so a
 * view placed ahead of the list kills the edge blur.
 */
export function ChooseChrome({
  title,
  placeholder,
  onQueryChange,
  ready,
  hasPicked,
  labels,
  onFind,
}: Props) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();

  const legacyBarStyle = useMemo(
    () => ({
      bottom: keyboard > 0 ? keyboard : 0,
      paddingTop: Space.sm,
      paddingBottom: keyboard > 0 ? Space.sm : insets.bottom + Space.sm,
    }),
    [keyboard, insets.bottom],
  );

  const fabStyle = useMemo(
    () => ({ bottom: (keyboard > 0 ? keyboard : insets.bottom) + Space.base }),
    [keyboard, insets.bottom],
  );

  return (
    <>
      {/* On iOS 26 the title moves into the large-title area, so the bar itself
          stays empty. Elsewhere it is the app bar title. */}
      <Stack.Screen options={{ headerTitle: chromeTier === 'ios26' ? '' : title }} />

      {chromeTier !== 'android' ? (
        <Stack.SearchBar
          placeholder={placeholder}
          onChangeText={(e) => onQueryChange(e.nativeEvent.text)}
          onClose={() => onQueryChange('')}
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
          <Stack.Toolbar.SearchBarSlot />
          {/* Keep this under 150pt: `SearchBarSlot` flexes and always insists on
              showing its text, so a wider sibling squeezes it into a 48pt circle. */}
          <Stack.Toolbar.Button
            variant="prominent"
            tintColor={Colors.brand.default}
            disabled={!ready || !hasPicked}
            accessibilityHint={
              hasPicked ? `Searching with ${labels.join(', ')}` : 'Pick at least one topic'
            }
            onPress={onFind}
          >
            Find therapists
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}

      {ready && chromeTier === 'iosLegacy' ? (
        <View className="absolute inset-x-0 bg-canvas px-4" style={legacyBarStyle}>
          <BarScrim />
          <FindButton labels={labels} disabled={!hasPicked} onPress={onFind} />
        </View>
      ) : null}

      {ready && chromeTier === 'android' ? (
        <BarReveal
          shown={hasPicked}
          distance={FAB_CLEARANCE + insets.bottom}
          className="absolute right-4"
          style={fabStyle}
        >
          <FindFab labels={labels} onPress={onFind} />
        </BarReveal>
      ) : null}
    </>
  );
}
