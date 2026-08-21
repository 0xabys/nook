import { describe, expect, it } from 'bun:test';

import { formatDuration } from '@/utils/duration';

describe('formatDuration', () => {
  it('zero-pads BOTH minutes and seconds', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(1_000)).toBe('00:01');
    expect(formatDuration(9_000)).toBe('00:09');
  });

  it('keeps the string width across the 10-minute mark', () => {
    expect(formatDuration(9 * 60_000).length).toBe(formatDuration(10 * 60_000).length);
    expect(formatDuration(10 * 60_000)).toBe('10:00');
  });

  it('truncates sub-second remainders instead of rounding up', () => {
    expect(formatDuration(1_999)).toBe('00:01');
  });

  it('rolls over correctly at 60 seconds', () => {
    expect(formatDuration(59_000)).toBe('00:59');
    expect(formatDuration(60_000)).toBe('01:00');
    expect(formatDuration(61_000)).toBe('01:01');
  });
});
