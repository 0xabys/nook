import { useMemo } from 'react';
import type { EntryOrExitLayoutType } from 'react-native-reanimated';

import { DisorderChip } from '@/components/disorder-chip';
import { Motion } from '@/theme';
import { Text, View } from '@/tw';
import { Animated } from '@/tw/animated';
import type { DisorderGroup as Group } from '@/utils/disorders';

type Props = {
  group: Group;
  /**
   * The `value`s selected IN this group, comma-joined. A string, not a `Set`: a
   * `Set` changes identity on every tap and re-renders every group. See
   * `groupKeys` on the Choose screen.
   */
  selectedKey: string;
  onToggle: (value: string) => void;
  groupIndex: number;
  entering: ((delayMs: number) => EntryOrExitLayoutType) | null;
};

export function DisorderGroup({ group, selectedKey, onToggle, groupIndex, entering }: Props) {
  const selected = useMemo(() => new Set(selectedKey ? selectedKey.split(',') : []), [selectedKey]);

  // Two NESTED stagger scales, not one running index. A running index pushes the
  // lower groups so late that the skeleton finishes fading before their chips
  // arrive. Groups keep the 40ms/group scale; the 25ms/chip cascade runs only
  // INSIDE a group, which is the actual problem — seven chips popping at once.
  const base = Math.min(groupIndex, Motion.listStaggerMaxItems) * Motion.listStagger;

  return (
    <View className="gap-3">
      <Animated.View className="gap-1" entering={entering?.(base)}>
        <Text className="type-overline text-ink">{group.label}</Text>
        {group.hint ? <Text className="type-caption max-w-80 text-ink">{group.hint}</Text> : null}
      </Animated.View>
      <View className="flex-row flex-wrap gap-2">
        {group.items.map((item, k) => (
          <Animated.View
            key={item.value}
            entering={entering?.(
              base + Math.min(k, Motion.chipStaggerMaxItems) * Motion.chipStagger,
            )}
          >
            <DisorderChip
              label={item.label}
              selected={selected.has(item.value)}
              onToggle={() => onToggle(item.value)}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
