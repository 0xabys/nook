import { useLocalSearchParams } from 'expo-router';

import { ResultsScreen } from '@/screens/results';

export default function ResultsRoute() {
  const { d, l } = useLocalSearchParams<{ d?: string; l?: string }>();
  const disorderIds = d ? d.split(',').filter(Boolean) : [];
  // When `l` is missing (a deep link, say) do NOT reconstruct labels from ids —
  // better to say nothing than to echo wording the user never saw.
  const disorderLabels = l ? l.split('|').filter(Boolean) : [];
  return <ResultsScreen disorderIds={disorderIds} disorderLabels={disorderLabels} />;
}
