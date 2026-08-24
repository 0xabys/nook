/**
 * String lists carried through navigation params.
 *
 * JSON rather than a hand-picked separator: disorder labels contain commas
 * ("Stress, burnout") and there is no character guaranteed absent from
 * server-provided copy. Decoding never throws — a malformed param yields an
 * empty list so a bad deep link degrades instead of crashing.
 */
export function encodeList(items: readonly string[]): string | undefined {
  return items.length > 0 ? JSON.stringify(items) : undefined;
}

export function decodeList(raw: string | undefined): string[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string' && value.length > 0);
  } catch {
    return [];
  }
}
