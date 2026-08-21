// Deep imports per icon. The `lucide-react-native` barrel pulls all 1768 —
// same lesson as the fonts in src/app/_layout.tsx.
import CalendarClock from 'lucide-react-native/icons/calendar-clock';
import CalendarDays from 'lucide-react-native/icons/calendar-days';
import Compass from 'lucide-react-native/icons/compass';
import MessagesSquare from 'lucide-react-native/icons/messages-square';
import Moon from 'lucide-react-native/icons/moon';
import Sparkles from 'lucide-react-native/icons/sparkles';
import Sun from 'lucide-react-native/icons/sun';

import type { ProviderTag } from '@/api/types';
import { Colors } from '@/theme';
import { Text, View } from '@/tw';

const ICON_SIZE = 16;

const ICONS: Record<string, typeof Moon> = {
  NUM_SESSION: MessagesSquare,
  METHOD: Compass,
  FLEXIBLE_OFFERING: CalendarClock,
  EVENING_AVAILABILITY: Moon,
  LUNCH_AVAILABILITY: Sun,
  WEEKEND_AVAILABILITY: CalendarDays,
};

type Props = { tags: ProviderTag[] };

export function TagRow({ tags }: Props) {
  return (
    <View className="flex-row items-center gap-4">
      {tags.map((tag, i) => {
        const Icon = ICONS[tag.type] ?? Sparkles;
        return (
          <View key={`${tag.type}-${i}`} className="shrink flex-row items-center gap-1">
            <Icon size={ICON_SIZE} color={Colors.text.secondary} strokeWidth={1.8} />
            <Text className="type-label shrink text-ink-soft" numberOfLines={1}>
              {tag.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
