
export interface CustomError extends Error {
  graphQLErrors?: { extensions?: { code: string } }[];
  networkError?: boolean | null;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
  message_type?: 'text' | 'code';
}

export interface Chat {
  id: string;
  title: string;
  is_public: boolean;
  share_token?: string | null;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
  message_count: number;
  messages?: ChatMessage[];
}

export interface ChatState {
  currentChat: Chat | null;
  chats: Chat[];
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

export interface SendMessageData {
  chatId: string
  content: string
  messageType?: 'text' | 'code' | 'image' | 'file'
}

export interface CreateChatData {
  title: string
  description?: string
}

export interface BotResponse {
  success: boolean
  message?: string
  bot_response?: string
  message_id?: string
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
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
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface ToastType {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Animation Types
export interface AnimationProps {
  duration?: number
  delay?: number
  className?: string
  children?: React.ReactNode
}

// Share Types
export interface ShareData {
  chatId: string
  shareType: 'email' | 'whatsapp' | 'link'
  recipientInfo?: string
  message?: string
}

export interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  chat: Chat
  onShare: (data: ShareData) => void
}

// Profile Types
export interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile | null
  onUpdateProfile: (data: Partial<UserProfile>) => void
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto'
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  isDark: boolean
}
