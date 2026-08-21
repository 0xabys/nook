export const GRAPHQL_ENDPOINT =
  process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT ?? 'https://api-dev.aepsy.com/graphql';

/** Pages are 1-based: `pageNum: 0` returns IndexOutOfBoundsException with HTTP 200. */
export const FIRST_PAGE = 1;
export const PAGE_SIZE = 10;

export const MIN_RECORDING_MS = 1000;
