// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { nhost } from '../lib/nhost';

export interface User {
  id: string;
  email: string;
  displayName: string;
  metadata?: Record<string, unknown>;
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Initial auth state check
    const checkInitialAuth = () => {
      try {
        const session = nhost.auth.getSession();
        const nhostUser = nhost.auth.getUser();
        
        if (import.meta.env.DEV) {
          console.log('Initial auth check:', { session: !!session, user: !!nhostUser });
        }

        setAuthState({
          user: nhostUser ? {
            id: nhostUser.id,
            email: nhostUser.email || '',
            displayName: nhostUser.displayName || nhostUser.email || 'User',
            metadata: nhostUser.metadata,
            emailVerified: nhostUser.emailVerified || false,
          } : null,
          loading: false,
          isAuthenticated: !!nhostUser,
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log('Auth check error:', error);
        }
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    // Check initial auth state
    checkInitialAuth();

    // Listen for auth state changes
    let unsubscribe: (() => void) | undefined;

    try {
      const unsub = nhost.auth.onAuthStateChanged((event, session) => {
        if (import.meta.env.DEV) {
          console.log('Auth state changed:', event, !!session);
        }

        const user = session?.user;
        setAuthState({
          user: user ? {
            id: user.id,
            email: user.email || '',
            displayName: user.displayName || user.email || 'User',
            metadata: user.metadata,
            emailVerified: user.emailVerified || false,
          } : null,
          loading: false,
          isAuthenticated: !!user,
        });
      });
      unsubscribe = () => { unsub(); };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('Auth listener setup failed:', error);
      }
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return authState;
};

// Authentication service functions
export const authService = {
  async signUp(email: string, password: string, options?: { displayName?: string }) {
    try {
      const result = await nhost.auth.signUp({
        email,
        password,
        options: {
          displayName: options?.displayName,
        },
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error: Error | unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      throw new Error(errorMessage);
    }
  },

  async signIn(email: string, password: string) {
    try {
      const result = await nhost.auth.signIn({
        email,
        password,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error: Error | unknown) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      throw new Error(errorMessage);
    }
  },

  async signOut() {
    try {
      const result = await nhost.auth.signOut();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error: Error | unknown) {
      console.error('Sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      throw new Error(errorMessage);
    }
  },

  async resetPassword(email: string) {
    try {
      const result = await nhost.auth.resetPassword({
        email,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error: Error | unknown) {
      console.error('Reset password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      throw new Error(errorMessage);
    }
  },

  getCurrentUser() {
    return nhost.auth.getUser();
  },

  getAccessToken() {
    return nhost.auth.getAccessToken();
  },

  isAuthenticated() {
    return nhost.auth.isAuthenticated();
  },
};