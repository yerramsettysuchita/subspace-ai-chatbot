// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { nhost } from './nhost';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: 'https://ymgklqfepmipcjojwxxc.hasura.ap-south-1.nhost.run/v1/graphql',
});

// WebSocket link for subscriptions (with error handling)
let wsLink: GraphQLWsLink | null = null;

try {
  wsLink = new GraphQLWsLink(
    createClient({
      url: 'wss://ymgklqfepmipcjojwxxc.hasura.ap-south-1.nhost.run/v1/graphql',
      connectionParams: () => {
        const session = nhost.auth.getSession();
        return {
          headers: session?.accessToken
            ? {
                Authorization: `Bearer ${session.accessToken}`,
              }
            : {},
        };
      },
      on: {
        connected: () => {
          if (import.meta.env.DEV) {
            console.log('🔌 WebSocket connected');
          }
        },
        error: (error) => {
          if (import.meta.env.DEV) {
            console.log('🔌 WebSocket error:', error);
          }
        },
      },
    })
  );
} catch (error) {
  if (import.meta.env.DEV) {
    console.log('⚠️ WebSocket setup failed:', error);
  }
}

// Auth link to add authentication headers
const authLink = setContext((_, { headers }) => {
  const session = nhost.auth.getSession();
  
  return {
    headers: {
      ...headers,
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    },
  };
});

// Split link: use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = wsLink 
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Debug Apollo Client in development
if (import.meta.env.DEV) {
  console.log('🚀 Apollo Client initialized');
}