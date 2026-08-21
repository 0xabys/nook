// Deep import per icon. The `lucide-react-native` barrel pulls all 1768 —
// measured with `expo export --platform ios`: 6536 KB vs 4772 KB.
import Search from 'lucide-react-native/icons/search';

import { Colors } from '@/theme';
import { Pressable, Text } from '@/tw';

type Props = {
  labels: string[];
  onPress: () => void;
};

export function FindFab({ labels, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Find therapists"
      accessibilityHint={`Searching with ${labels.join(', ')}`}
      android_ripple={{ color: Colors.bg.canvasStrong, borderless: false }}
      className="press h-14 flex-row items-center gap-3 rounded-2xl bg-brand px-5"
      // M3 elevation 3. `elevation` is Android-only and has no Tailwind class.
      // The FAB floats above content so it needs a real shadow, unlike the
      // provider card, which separates by color contrast.
      style={{ elevation: 3 }}
    >
      <Search size={20} color={Colors.brand.onDefault} strokeWidth={2} />
      <Text className="type-callout-strong text-on-brand">Find therapists</Text>
    </Pressable>
  );
}
