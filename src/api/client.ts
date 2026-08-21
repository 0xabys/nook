import { GraphQLClient } from 'graphql-request';

import { GRAPHQL_ENDPOINT } from '@/constants';

export const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);
