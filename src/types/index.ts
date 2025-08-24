import { ReactNode } from 'react'

export interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  title?: string
}

export interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'textarea'
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  metadata?: Record<string, unknown>;
  emailVerified: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
  message_type?: 'text' | 'code';
  created_at: string;
  chat_id: string;
}

export interface Chat {
  id: string;
  title: string;
  is_public: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  message_count: number;
  user_id: string;
  messages?: Message[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
  isTyping?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export type AuthView = 'welcome' | 'login' | 'signup' | 'chat' | 'verify-email' | 'forgot-password';

export interface CreateChatInput {
  title: string;
  isPublic?: boolean;
  shareToken?: string;
}

export interface CreateMessageInput {
  chatId: string;
  title: string;
  description: string;
  messageCount: number;
}

export interface UpdateChatInput {
  chatId: string;
  title?: string;
  isPublic?: boolean;
  lastMessageAt?: string;
  messageCount?: number;
}

export interface ShareChatOptions {
  method: 'email' | 'whatsapp' | 'copy';
  chatId: string;
  chatTitle: string;
  messages: ChatMessage[];
}