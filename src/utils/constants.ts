// ============= src/utils/constants.ts =============
export const APP_CONFIG = {
  NAME: 'Subspace AI',
  VERSION: '1.0.0',
  DESCRIPTION: 'Your Intelligent Conversation Partner',
  MAX_MESSAGE_LENGTH: 4000,
  MAX_CHAT_TITLE_LENGTH: 100,
  TYPING_DELAY_MIN: 1000,
  TYPING_DELAY_MAX: 3000,
}

export const MESSAGE_TYPES = {
  TEXT: 'text',
  CODE: 'code',
  IMAGE: 'image',
  FILE: 'file'
} as const

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const

export const QUICK_PROMPTS = [
  "Explain quantum computing",
  "Write a React component",
  "Help me with Python",
  "Creative writing tips",
  "Productivity strategies",
  "Debug my code",
  "Plan a project",
  "Learn a new concept"
]

export const BOT_RESPONSES = {
  GREETING: "👋 Hello! I'm Subspace AI, ready to help with any questions or tasks you have!",
  ERROR: "I apologize, but I encountered an error. Please try again.",
  THINKING: "Let me think about that...",
  NO_CONTEXT: "I'd be happy to help! Could you provide more context about what you're looking for?"
}
