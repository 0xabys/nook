import { describe, expect, it } from 'bun:test';

import { dedupeProviders, nextPageParam, totalSizeOf } from './pagination';
import type { Provider, ProvidersPage } from './types';

function provider(uid: string): Provider {
  return {
    userInfo: { firebaseUid: uid, avatar: null },
    userName: { firstName: 'A', lastName: 'B' },
    profile: {
      providerInfo: { yearExperience: null, providerTitle: null },
      providerTagInfo: null,
    },
  };
}

function page(uids: string[], extra: Partial<ProvidersPage> = {}): ProvidersPage {
  return {
    canLoadMore: false,
    totalSize: 0,
    providers: uids.map(provider),
    ...extra,
  };
}

describe('dedupeProviders', () => {
  it('returns an empty list when nothing is loaded', () => {
    expect(dedupeProviders(undefined)).toEqual([]);
    expect(dedupeProviders([])).toEqual([]);
  });

  it('concatenates pages in order', () => {
    const out = dedupeProviders([page(['a', 'b']), page(['c'])]);
    expect(out.map((p) => p.userInfo.firebaseUid)).toEqual(['a', 'b', 'c']);
  });

  it('keeps the first occurrence when a provider repeats across pages', () => {
    const out = dedupeProviders([page(['a', 'b']), page(['b', 'c'])]);
    expect(out.map((p) => p.userInfo.firebaseUid)).toEqual(['a', 'b', 'c']);
  });

  it('dedupes within a single page too', () => {
    const out = dedupeProviders([page(['a', 'a'])]);
    expect(out).toHaveLength(1);
  });

  it('drops entries with no id rather than emitting a duplicate key', () => {
    const broken = { ...provider('x'), userInfo: { firebaseUid: '', avatar: null } };
    const out = dedupeProviders([{ ...page(['a']), providers: [broken, provider('a')] }]);
    expect(out.map((p) => p.userInfo.firebaseUid)).toEqual(['a']);
  });

  it('survives a page whose providers field is null', () => {
    const nulled = {
      canLoadMore: false,
      totalSize: 0,
      providers: null,
    } as unknown as ProvidersPage;
    expect(dedupeProviders([nulled, page(['a'])])).toHaveLength(1);
  });
});

describe('totalSizeOf', () => {
  it('reads the first page only, ignoring the 0 later pages report', () => {
    expect(totalSizeOf([page([], { totalSize: 42 }), page([], { totalSize: 0 })])).toBe(42);
  });

  it('is 0 before anything is loaded', () => {
    expect(totalSizeOf(undefined)).toBe(0);
    expect(totalSizeOf([])).toBe(0);
  });
});

describe('nextPageParam', () => {
  it('advances while the server says there is more', () => {
    expect(nextPageParam(page([], { canLoadMore: true }), 1)).toBe(2);
  });

  it('stops at the last page', () => {
    expect(nextPageParam(page([], { canLoadMore: false }), 3)).toBeUndefined();
  });
});
