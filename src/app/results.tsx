import { useLocalSearchParams } from 'expo-router';

import { ResultsScreen } from '@/screens/results';
import { decodeList } from '@/utils/params';

export default function ResultsRoute() {
  const { d, l } = useLocalSearchParams<{ d?: string; l?: string }>();
  // When `l` is missing (a deep link, say) do NOT reconstruct labels from ids —
  // better to say nothing than to echo wording the user never saw.
  return <ResultsScreen disorderIds={decodeList(d)} disorderLabels={decodeList(l)} />;
}
