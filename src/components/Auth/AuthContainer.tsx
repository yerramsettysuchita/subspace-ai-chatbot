// ============= src/components/Auth/AuthContainer.tsx =============
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import WelcomeAnimation from '../Animations/WelcomeAnimation'

type AuthView = 'welcome' | 'login' | 'signup' | 'forgot-password'

const AuthContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('welcome')

  const showWelcomeAnimation = currentView === 'welcome'

  React.useEffect(() => {
    if (currentView === 'welcome') {
      const timer = setTimeout(() => {
        setCurrentView('login')
      }, 3000) // Show animation for 3 seconds
      return () => clearTimeout(timer)
    }
  }, [currentView])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  if (showWelcomeAnimation) {
    return <WelcomeAnimation />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <motion.h1 
              className="subspace-logo text-3xl font-bold mb-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              Subspace AI
            </motion.h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back to intelligent conversations
            </p>
          </div>

          <AnimatePresence mode="wait">
            {currentView === 'login' && (
              <motion.div
                key="login"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <LoginForm 
                  onSwitchToSignup={() => setCurrentView('signup')}
                  onSwitchToForgot={() => setCurrentView('forgot-password')}
                />
              </motion.div>
            )}

            {currentView === 'signup' && (
              <motion.div
                key="signup"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <SignUpForm 
                  onSwitchToLogin={() => setCurrentView('login')}
                />
              </motion.div>
            )}

            {currentView === 'forgot-password' && (
              <motion.div
                key="forgot"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <ForgotPasswordForm 
                  onBackToLogin={() => setCurrentView('login')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthContainer
