import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { FIRST_PAGE, PAGE_SIZE } from '@/constants';

import { gqlClient } from './client';
import { dedupeProviders, nextPageParam, totalSizeOf } from './pagination';
import { SEARCH_PROVIDERS } from './queries';
import type { ProvidersPage, SearchProvidersResponse } from './types';

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
    getNextPageParam: (lastPage, _all, lastPageParam) => nextPageParam(lastPage, lastPageParam),
  });

  const providers = useMemo(() => dedupeProviders(query.data?.pages), [query.data]);

  return {
    providers,
    totalSize: totalSizeOf(query.data?.pages),
    isLoading: query.isPending,
    /** The FIRST page failed — there is nothing on screen to keep. */
    isError: query.isError && providers.length === 0,
    /** A load-more failed while earlier pages are still on screen. */
    isPageError: query.isError && providers.length > 0,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
