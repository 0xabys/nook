import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { FIRST_PAGE, PAGE_SIZE } from '@/constants';

import { gqlClient } from './client';
import { SEARCH_PROVIDERS } from './queries';
import type { Provider, ProvidersPage, SearchProvidersResponse } from './types';

/**
 * Paginates SEARCH_PROVIDERS. Pages are 1-based: `pageNum: 0` makes the server
 * answer HTTP 200 with an IndexOutOfBoundsException body, so the failure shows
 * up as broken data rather than a thrown error.
 *
 * On the dev API `rawDisorders` filters nothing — every selection returns the
 * same people. UI copy has to stay honest about that.
 */
export function useProviders(disorderIds: string[]) {
  const key = useMemo(() => [...disorderIds].sort(), [disorderIds]);

  const query = useInfiniteQuery({
    queryKey: ['providers', key],
    initialPageParam: FIRST_PAGE,
    staleTime: 5 * 60_000,
    queryFn: async ({ pageParam }): Promise<ProvidersPage> => {
      const res = await gqlClient.request<SearchProvidersResponse>(SEARCH_PROVIDERS, {
        pageNum: pageParam,
        pageSize: PAGE_SIZE,
        rawDisorders: key,
      });
      return res.searchProviders.providers;
    },
    getNextPageParam: (lastPage, _all, lastPageParam) =>
      lastPage.canLoadMore ? lastPageParam + 1 : undefined,
  });

  const providers = useMemo(() => {
    const pages = query.data?.pages ?? [];
    // Page-number pagination, not cursors: if the result set shifts between
    // fetches the same person can land on two pages. Dedupe by firebaseUid so
    // the list never sees a duplicate key.
    const seen = new Set<string>();
    const out: Provider[] = [];
    for (const page of pages) {
      for (const p of page.providers ?? []) {
        const id = p.userInfo?.firebaseUid;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        out.push(p);
      }
    }
    return out;
  }, [query.data]);

  return {
    providers,
    /** From the FIRST page — later pages report 0. */
    totalSize: query.data?.pages[0]?.totalSize ?? 0,
    isLoading: query.isPending,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
