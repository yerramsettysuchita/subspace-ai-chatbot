// ============= src/components/Auth/SignUpForm.tsx =============
import React, { useState } from 'react'
import { useSignUpEmailPassword } from '@nhost/react'
import { motion } from 'framer-motion'
import Button from '../UI/Button'
import Input from '../UI/Input'
import { showToast } from '../UI/Toast'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface SignUpFormProps {
  onSwitchToLogin: () => void
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const { signUpEmailPassword, isLoading, error, needsEmailVerification } = useSignUpEmailPassword()

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const result = await signUpEmailPassword(email, password, {
        displayName: displayName.trim()
      })
      
      if (result.error) {
        showToast.error(result.error.message)
      } else if (needsEmailVerification) {
        showToast.success('Check your email for verification link!')
      } else {
        showToast.success('Account created successfully!')
      }
    } catch (err) {
      showToast.error('Sign up failed. Please try again.')
    }
  }

  if (needsEmailVerification) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent a verification link to <span className="font-medium">{email}</span>.
          Please check your email and click the link to activate your account.
        </p>
        <Button
          variant="secondary"
          onClick={onSwitchToLogin}
        >
          Back to Login
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Display Name"
          placeholder="Enter your name"
          value={displayName}
          onChange={setDisplayName}
          error={errors.displayName}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={errors.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Password strength indicator */}
        {password && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">Password strength:</div>
            <div className="space-y-1 text-xs">
              <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-gray-400'}`} />
                At least 8 characters
              </div>
              <div className={`flex items-center gap-2 ${/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? 'bg-green-600' : 'bg-gray-400'}`} />
                Uppercase and lowercase letters
              </div>
              <div className={`flex items-center gap-2 ${/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*\d)/.test(password) ? 'bg-green-600' : 'bg-gray-400'}`} />
                At least one number
              </div>
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {error.message}
          </motion.div>
        )}

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Sign in
          </button>
        </p>
      </form>
    </motion.div>
  )
}

export default SignUpForm
