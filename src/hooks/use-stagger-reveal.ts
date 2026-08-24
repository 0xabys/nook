import { useEffect, useState } from 'react';

/**
 * One-shot gate for an entrance stagger: `false` while the cascade is allowed
 * to play, `true` for good once `windowMs` has passed since `active` went true.
 *
 * Motion a user meets dozens of times a session should play once. Tying the
 * stagger to the rendered list instead would replay it on every keystroke that
 * re-filters that list.
 */
export function useStaggerReveal(active: boolean, windowMs: number): boolean {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || done) return;
    const timer = setTimeout(() => setDone(true), windowMs);
    return () => clearTimeout(timer);
  }, [active, done, windowMs]);

  return done;
}
