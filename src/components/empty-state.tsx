import SearchX from 'lucide-react-native/icons/search-x';

import { Colors } from '@/theme';
import { Pressable, Text, View } from '@/tw';

type Props = {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: Props) {
  return (
    <View className="items-center gap-3 px-6 pt-12">
      <SearchX
        size={48}
        color={Colors.text.placeholder}
        strokeWidth={1.5}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <Text className="type-title text-center text-ink-strong">{title}</Text>
      <Text className="type-callout text-center text-ink">{body}</Text>
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        className="press mt-2 min-h-11 justify-center rounded-full bg-brand px-6"
      >
        <Text className="type-label text-on-brand">{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
