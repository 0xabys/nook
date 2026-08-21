import { useLocalSearchParams } from 'expo-router';

import { ChooseScreen } from '@/screens/choose';

export default function ChooseRoute() {
  const { audio } = useLocalSearchParams<{ audio?: string }>();
  return <ChooseScreen audioUri={audio ?? null} />;
}
