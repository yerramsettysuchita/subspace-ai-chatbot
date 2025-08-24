// src/lib/mutations.ts
import { gql } from '@apollo/client';

export const CREATE_USER_PROFILE = gql`
  mutation CreateUserProfile($userId: uuid!, $username: String!, $description: String) {
    insert_user_profiles_one(object: {
      user_id: $userId
      username: $username
      description: $description
    }) {
      id
      user_id
      username
      description
      created_at
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($userId: uuid!, $username: String, $description: String) {
    update_user_profiles(
      where: { user_id: { _eq: $userId } }
      _set: { username: $username, description: $description, updated_at: "now()" }
    ) {
      affected_rows
      returning {
        id
        username
        description
        updated_at
      }
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $userId: uuid!, $isPublic: Boolean = false, $shareToken: String) {
    insert_chats_one(object: {
      title: $title
      user_id: $userId
      is_public: $isPublic
      share_token: $shareToken
    }) {
      id
      title
      is_public
      share_token
      created_at
      user_id
    }
  }
`;

export const UPDATE_CHAT = gql`
  mutation UpdateChat(
    $chatId: uuid!, 
    $title: String, 
    $isPublic: Boolean, 
    $lastMessageAt: timestamptz,
    $messageCount: Int
  ) {
    update_chats(
      where: { id: { _eq: $chatId } }
      _set: { 
        title: $title, 
        is_public: $isPublic,
        last_message_at: $lastMessageAt,
        message_count: $messageCount,
        updated_at: "now()" 
      }
    ) {
      affected_rows
      returning {
        id
        title
        is_public
        last_message_at
        message_count
        updated_at
      }
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: uuid!) {
    delete_messages(where: { chat_id: { _eq: $chatId } }) {
      affected_rows
    }
    delete_chats(where: { id: { _eq: $chatId } }) {
      affected_rows
    }
  }
`;

export const CREATE_MESSAGE = gql`
  mutation CreateMessage(
    $chatId: uuid!
    $title: String!
    $description: String!
    $messageCount: Int!
  ) {
    insert_messages_one(object: {
      chat_id: $chatId
      title: $title
      description: $description
      message_count: $messageCount
    }) {
      id
      title
      description
      message_count
      created_at
      chat_id
      user_id
    }
  }
`;

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($messageId: uuid!, $title: String, $description: String) {
    update_messages(
      where: { id: { _eq: $messageId } }
      _set: { title: $title, description: $description, updated_at: "now()" }
    ) {
      affected_rows
      returning {
        id
        title
        description
        updated_at
      }
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: uuid!) {
    delete_messages(where: { id: { _eq: $messageId } }) {
      affected_rows
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $content: String!, $messageType: String!) {
    insert_messages_one(object: {
      chat_id: $chatId
      content: $content
      message_type: $messageType
      isBot: false
      timestamp: "now()"
    }) {
      id
      content
      isBot
      timestamp
      message_type
      created_at
    }
  }
`;

export const INSERT_BOT_MESSAGE = gql`
  mutation InsertBotMessage($chatId: uuid!, $content: String!, $messageType: String!) {
    insert_messages_one(object: {
      chat_id: $chatId
      content: $content
      message_type: $messageType
      isBot: true
      timestamp: "now()"
    }) {
      id
      content
      isBot
      timestamp
      message_type
      created_at
    }
  }
`;

export const DELETE_ALL_USER_CHATS = gql`
  mutation DeleteAllUserChats($userId: uuid!) {
    delete_messages(where: { chat: { user_id: { _eq: $userId } } }) {
      affected_rows
    }
    delete_chats(where: { user_id: { _eq: $userId } }) {
      affected_rows
    }
  }
`;
