// src/lib/queries.ts
import { gql } from '@apollo/client';

export const GET_CHAT_BY_ID = gql`
  query GetChatById($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      id
      title
      is_public
      share_token
      created_at
      updated_at
      last_message_at
      message_count
      messages {
        id
        content
        isBot
        timestamp
        message_type
        created_at
      }
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: uuid!) {
    user_profiles(where: { user_id: { _eq: $userId } }) {
      id
      user_id
      username
      description
      created_at
      updated_at
    }
  }
`;

export const GET_USER_CHATS = gql`
  query GetUserChats($userId: uuid!) {
    chats(
      where: { user_id: { _eq: $userId } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      is_public
      share_token
      created_at
      updated_at
      last_message_at
      message_count
      messages(limit: 1, order_by: { created_at: desc }) {
        id
        title
        description
        created_at
      }
    }
  }
`;

export const GET_CHAT_WITH_MESSAGES = gql`
  query GetChatWithMessages($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      id
      title
      is_public
      created_at
      updated_at
      messages(order_by: { created_at: asc }) {
        id
        title
        description
        message_count
        created_at
        updated_at
        user_id
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      title
      description
      message_count
      created_at
      updated_at
      user_id
      chat_id
    }
  }
`;

export const GET_SHARED_CHAT = gql`
  query GetSharedChat($shareToken: String!) {
    chats(where: { share_token: { _eq: $shareToken }, is_public: { _eq: true } }) {
      id
      title
      created_at
      user_profiles {
        username
      }
      messages(order_by: { created_at: asc }) {
        id
        title
        description
        created_at
      }
    }
  }
`;

export const SEARCH_CHATS = gql`
  query SearchChats($userId: uuid!, $searchTerm: String!) {
    chats(
      where: {
        user_id: { _eq: $userId }
        _or: [
          { title: { _ilike: $searchTerm } }
          { messages: { title: { _ilike: $searchTerm } } }
          { messages: { description: { _ilike: $searchTerm } } }
        ]
      }
      order_by: { updated_at: desc }
    ) {
      id
      title
      created_at
      updated_at
      message_count
    }
  }
`;