// src/lib/subscriptions.ts
import { gql, useSubscription } from '@apollo/client';

export const MESSAGES_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      content
      is_bot
      created_at
      user_id
    }
  }
`;

export const SUBSCRIBE_TO_USER_CHATS = gql`
  subscription SubscribeToUserChats($userId: uuid!) {
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
    }
  }
`;

export const SUBSCRIBE_TO_NEW_MESSAGES = gql`
  subscription SubscribeToNewMessages($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      title
      description
      message_count
      created_at
      user_id
      chat_id
    }
  }
`;

export const SUBSCRIBE_TO_CHAT_UPDATES = gql`
  subscription SubscribeToChatUpdates($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      id
      title
      is_public
      updated_at
      last_message_at
      message_count
    }
  }
`;

export function useMessagesSubscription(selectedChatId: string) {
  return useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId: selectedChatId },
  });
}