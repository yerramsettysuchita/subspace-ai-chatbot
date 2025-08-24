import { APP_CONFIG } from './constants';
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain uppercase, lowercase, and number'
  }
  return null
}

export const validateDisplayName = (name: string): string | null => {
  if (!name.trim()) return 'Display name is required'
  if (name.trim().length < 2) return 'Display name must be at least 2 characters'
  if (name.trim().length > 50) return 'Display name must be less than 50 characters'
  return null
}

export const validateMessage = (message: string): string | null => {
  if (!message.trim()) return 'Message cannot be empty'
  if (message.length > APP_CONFIG.MAX_MESSAGE_LENGTH) {
    return `Message too long (max ${APP_CONFIG.MAX_MESSAGE_LENGTH} characters)`
  }
  return null
}

export const validateChatTitle = (title: string): string | null => {
  if (!title.trim()) return 'Chat title is required'
  if (title.trim().length > APP_CONFIG.MAX_CHAT_TITLE_LENGTH) {
    return `Title too long (max ${APP_CONFIG.MAX_CHAT_TITLE_LENGTH} characters)`
  }
  return null
}
