import { Pressable, Text, View } from '@/tw';
import { cn } from '@/tw/cn';

const ROOT = 'h-11 overflow-hidden rounded-full';

type Props = {
  labels: string[];
  disabled: boolean;
  onPress: () => void;
};

export function FindButton({ labels, disabled, onPress }: Props) {
  const label = (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Find therapists"
      accessibilityState={{ disabled }}
      accessibilityHint={
        disabled ? 'Pick at least one topic' : `Searching with ${labels.join(', ')}`
      }
      className="press flex-1 items-center justify-center px-6"
    >
      <Text className="type-callout-strong text-on-brand">Find therapists</Text>
    </Pressable>
  );

  return <View className={cn(ROOT, 'bg-brand', disabled && 'opacity-40')}>{label}</View>;
}
