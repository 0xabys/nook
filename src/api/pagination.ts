import type { Provider, ProvidersPage } from './types';

/**
 * Flattens loaded pages into one list.
 *
 * Page-number pagination, not cursors: if the result set shifts between fetches
 * the same person can land on two pages. Deduping by `firebaseUid` keeps the
 * list from ever seeing a duplicate key. Entries without an id are dropped —
 * there is nothing stable to key them by.
 */
export function dedupeProviders(pages: readonly ProvidersPage[] | undefined): Provider[] {
  if (!pages) return [];

  const seen = new Set<string>();
  const out: Provider[] = [];

  for (const page of pages) {
    for (const provider of page?.providers ?? []) {
      const id = provider?.userInfo?.firebaseUid;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(provider);
    }
  }

  return out;
}

/** `totalSize` collapses to 0 past the last page, so only the first page counts. */
export function totalSizeOf(pages: readonly ProvidersPage[] | undefined): number {
  return pages?.[0]?.totalSize ?? 0;
}

/** Pages are 1-based; `undefined` tells React Query there is nothing left. */
export function nextPageParam(lastPage: ProvidersPage, lastPageParam: number): number | undefined {
  return lastPage?.canLoadMore ? lastPageParam + 1 : undefined;
}
