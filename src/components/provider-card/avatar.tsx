import type { Provider } from '@/api/types';
import { Text, View } from '@/tw';
import { Image } from '@/tw/image';
import { initialsOf } from '@/utils/provider';

type Props = {
  uri: string | null;
  name: Provider['userName'];
  recyclingKey: string;
};

const BASE = 'size-14 rounded-full bg-selected';

export function Avatar({ uri, name, recyclingKey }: Props) {
  if (!uri) {
    return (
      <View className={`${BASE} items-center justify-center`}>
        <Text className="font-serif text-[20px] leading-[26px] text-ink">{initialsOf(name)}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      recyclingKey={recyclingKey}
      className={`${BASE} object-cover`}
      transition={180}
      accessibilityIgnoresInvertColors
    />
  );
}
