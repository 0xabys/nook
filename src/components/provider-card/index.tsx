import type { Provider } from '@/api/types';
import { Text, View } from '@/tw';
import { formatExperience, formatTitle, fullNameOf, pickTags } from '@/utils/provider';

import { Avatar } from './avatar';
import { TagRow } from './tag-row';

type Props = { provider: Provider };

export function ProviderCard({ provider }: Props) {
  const name = fullNameOf(provider.userName);
  const experience = formatExperience(provider.profile?.providerInfo?.yearExperience);
  const title = formatTitle(provider.profile?.providerInfo?.providerTitle);
  const tags = pickTags(provider.profile?.providerTagInfo?.tags);

  return (
    <View className="gap-3 rounded-md bg-surface p-4" accessible accessibilityRole="summary">
      <View className="flex-row items-center gap-4">
        <Avatar
          uri={provider.userInfo?.avatar ?? null}
          name={provider.userName}
          recyclingKey={provider.userInfo?.firebaseUid ?? name}
        />
        <View className="flex-1 gap-0.5">
          <Text className="type-body-strong text-ink" numberOfLines={2}>
            {name}
          </Text>
          {experience ? <Text className="type-label text-ink-soft">{experience}</Text> : null}
          {title ? <Text className="type-label text-ink-soft">{title}</Text> : null}
        </View>
      </View>

      {tags.length > 0 ? (
        <>
          <View className="h-px bg-hairline" />
          <TagRow tags={tags} />
        </>
      ) : null}
    </View>
  );
}
