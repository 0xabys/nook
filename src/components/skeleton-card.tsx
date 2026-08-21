import { usePulse } from '@/hooks/use-pulse';
import { View } from '@/tw';
import { Animated } from '@/tw/animated';

export function SkeletonCard() {
  const animated = usePulse();

  return (
    <Animated.View
      className="flex-row items-center gap-4 rounded-md bg-surface p-4"
      style={animated}
      accessibilityElementsHidden
    >
      <View className="size-14 rounded-full bg-sunken" />
      <View className="flex-1 gap-2">
        <View className="h-3 w-[62%] rounded-xs bg-sunken" />
        <View className="h-3 w-2/5 rounded-xs bg-sunken" />
      </View>
    </Animated.View>
  );
}
