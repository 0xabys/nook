import { Pressable, Text } from '@/tw';
import { cn } from '@/tw/cn';

type Props = {
  label: string;
  selected: boolean;
  onToggle: () => void;
};

export function DisorderChip({ label, selected, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      // Chip is 40 tall, minimum touch target 44 — 2 on each side.
      hitSlop={2}
      className={cn(
        'press h-10 flex-row items-center gap-2 rounded-full border px-4',
        selected ? 'border-brand bg-brand' : 'border-line bg-surface',
      )}
    >
      <Text className={cn('type-label', selected ? 'text-on-brand' : 'text-ink')}>{label}</Text>
    </Pressable>
  );
}
