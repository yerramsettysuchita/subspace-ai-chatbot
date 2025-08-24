// ============= src/types/auth.ts =============

export interface User {
  id: string
  email: string
  displayName?: string
  emailVerified?: boolean
  metadata?: Record<string, unknown>
}
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
  displayName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface ServerProfile {
  id: string
  user_id: string
  display_name?: string
  bio?: string
  avatar_url?: string
  theme_preference?: string
  created_at: string
  updated_at: string
}
