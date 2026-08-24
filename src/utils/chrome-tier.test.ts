import { describe, expect, it } from 'bun:test';

import { resolveChromeTier } from './chrome-tier';

describe('resolveChromeTier', () => {
  it('treats every non-iOS platform as the Android tier', () => {
    expect(resolveChromeTier('android', 35)).toBe('android');
    expect(resolveChromeTier('web', '1')).toBe('android');
  });

  it('splits iOS on the major version, where the new chrome lands', () => {
    expect(resolveChromeTier('ios', '25.4')).toBe('iosLegacy');
    expect(resolveChromeTier('ios', '26.0')).toBe('ios26');
    expect(resolveChromeTier('ios', '27.1')).toBe('ios26');
  });

  it('falls back to the legacy chrome when the version is unreadable', () => {
    expect(resolveChromeTier('ios', 'unknown')).toBe('iosLegacy');
    expect(resolveChromeTier('ios', '')).toBe('iosLegacy');
  });
});
