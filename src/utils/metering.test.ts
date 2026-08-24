import { describe, expect, it } from 'bun:test';

import { METER_FLOOR_DB, normalizeMetering } from './metering';

describe('normalizeMetering', () => {
  it('maps the floor to 0 and silence-free peak to 1', () => {
    expect(normalizeMetering(METER_FLOOR_DB)).toBe(0);
    expect(normalizeMetering(0)).toBe(1);
  });

  it('maps the midpoint to 0.5', () => {
    expect(normalizeMetering(METER_FLOOR_DB / 2)).toBeCloseTo(0.5, 5);
  });

  it('clamps below the floor and above the ceiling', () => {
    expect(normalizeMetering(-160)).toBe(0);
    expect(normalizeMetering(12)).toBe(1);
  });

  it('treats a missing or non-finite reading as silence', () => {
    expect(normalizeMetering(undefined)).toBe(0);
    expect(normalizeMetering(null)).toBe(0);
    expect(normalizeMetering(Number.NaN)).toBe(0);
    expect(normalizeMetering(-Infinity)).toBe(0);
  });
});
