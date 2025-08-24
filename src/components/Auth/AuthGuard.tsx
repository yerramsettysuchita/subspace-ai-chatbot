// ============= src/components/Auth/AuthGuard.tsx =============
import React from 'react'
import { useAuthenticationStatus } from '@nhost/react'
import AuthContainer from './AuthContainer'
import LoadingAnimation from '../Animations/LoadingAnimation'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <LoadingAnimation message="Initializing Subspace AI..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthContainer />
  }

  return <>{children}</>
}

export default AuthGuard
