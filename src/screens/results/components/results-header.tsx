import { Voiceprint } from '@/components/voiceprint';
import { Text, View } from '@/tw';

type Props = {
  labels: string[];
  total: number | null;
};

export function ResultsHeader({ labels, total }: Props) {
  return (
    <View className="gap-3 pb-4 pt-5">
      {labels.length > 0 ? (
        <View className="flex-row items-center gap-3">
          <Voiceprint />
          <Text className="type-caption shrink text-ink" numberOfLines={2}>
            {labels.join(' · ')}
          </Text>
        </View>
      ) : null}
      <Text className="type-title text-ink-strong">
        {total == null ? 'Therapists taking clients' : `${total} therapists taking clients`}
      </Text>
    </View>
  );
}
