import { Voiceprint } from '@/components/voiceprint';
import { Text, View } from '@/tw';

type Props = {
  title: string;
  description: string;
  analysing?: boolean;
  settling?: boolean;
};

export function ScreenHeadline({ title, description, analysing = false, settling = false }: Props) {
  return (
    <View className="gap-2 pb-1 pt-5">
      <View className="flex-row items-center gap-3">
        <Voiceprint animating={analysing} settling={settling} />
        <Text className="type-title shrink text-ink-strong" accessibilityRole="header">
          {title}
        </Text>
      </View>
      <Text className="type-callout text-ink">{description}</Text>
    </View>
  );
}
