import React from 'react';
import {
  ActivityIndicator as RNActivityIndicator,
  FlatList as RNFlatList,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
  type FlatListProps as RNFlatListProps,
} from 'react-native';
import { useCssElement, useNativeVariable } from 'react-native-css';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

/**
 * `useCssElement` infers its mapping from the component's ENTIRE prop tree. For
 * Pressable / ScrollView / FlatList that tree is big enough to make tsc give up
 * (TS2590), so the cast happens once here. Each wrapper below still exposes the
 * real component type, so callers lose nothing.
 */
export const cssElement = useCssElement as (
  component: unknown,
  props: object,
  mapping: Record<string, string>,
) => React.ReactElement;

const STYLE = { className: 'style' };
const SCROLL = { className: 'style', contentContainerClassName: 'contentContainerStyle' };

export type ViewProps = React.ComponentProps<typeof RNView> & { className?: string };

export const View = (props: ViewProps) => cssElement(RNView, props, STYLE);
View.displayName = 'CSS(View)';

export type TextProps = React.ComponentProps<typeof RNText> & { className?: string };

export const Text = (props: TextProps) => cssElement(RNText, props, STYLE);
Text.displayName = 'CSS(Text)';

export type PressableProps = React.ComponentProps<typeof RNPressable> & { className?: string };

export const Pressable = (props: PressableProps) => cssElement(RNPressable, props, STYLE);
Pressable.displayName = 'CSS(Pressable)';

export type ScrollViewProps = React.ComponentProps<typeof RNScrollView> & {
  className?: string;
  contentContainerClassName?: string;
};

export const ScrollView = (props: ScrollViewProps) => cssElement(RNScrollView, props, SCROLL);
ScrollView.displayName = 'CSS(ScrollView)';

export type SafeAreaViewProps = React.ComponentProps<typeof RNSafeAreaView> & {
  className?: string;
};

export const SafeAreaView = (props: SafeAreaViewProps) => cssElement(RNSafeAreaView, props, STYLE);
SafeAreaView.displayName = 'CSS(SafeAreaView)';

export type TextInputProps = React.ComponentProps<typeof RNTextInput> & { className?: string };

export const TextInput = (props: TextInputProps) => cssElement(RNTextInput, props, STYLE);
TextInput.displayName = 'CSS(TextInput)';

export type ActivityIndicatorProps = React.ComponentProps<typeof RNActivityIndicator> & {
  className?: string;
};

export const ActivityIndicator = (props: ActivityIndicatorProps) =>
  cssElement(RNActivityIndicator, props, STYLE);
ActivityIndicator.displayName = 'CSS(ActivityIndicator)';

/** FlatList keeps its generic — without it every `renderItem` degrades to `any`. */
type FlatListProps<ItemT> = RNFlatListProps<ItemT> & {
  className?: string;
  contentContainerClassName?: string;
};

export const FlatList = (<ItemT,>(props: FlatListProps<ItemT>) =>
  cssElement(RNFlatList, props, SCROLL)) as <ItemT>(
  props: FlatListProps<ItemT>,
) => React.ReactElement;

export const useCSSVariable =
  process.env.EXPO_OS !== 'web' ? useNativeVariable : (variable: string) => `var(${variable})`;
