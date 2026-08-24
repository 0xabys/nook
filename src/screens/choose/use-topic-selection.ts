import { useCallback, useMemo, useState } from 'react';

import type { DisorderOption } from '@/hooks/use-audio-transcriber';
import { labelsFor } from '@/utils/disorders';
import { tapSelect } from '@/utils/haptics';

export function useTopicSelection(options: DisorderOption[] | null) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  const toggle = useCallback((value: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    tapSelect();
  }, []);

  const ids = useMemo(() => Array.from(selected), [selected]);
  const labels = useMemo(() => labelsFor(options, ids), [options, ids]);

  return { selected, toggle, ids, labels, hasPicked: ids.length > 0 };
}
