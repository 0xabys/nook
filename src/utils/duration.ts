/**
 * mm:ss for the recording clock — BOTH halves zero-padded. The clock declares
 * `fontVariant: ['tabular-nums']` so digits never shift; an unpadded minute
 * would still grow the string from 4 to 5 characters at the 10-minute mark and
 * undo that.
 */
export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
