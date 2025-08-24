// ============= src/components/Auth/ForgotPasswordForm.tsx =============
import React, { useState } from 'react'
import { useResetPassword } from '@nhost/react'
import { motion } from 'framer-motion'
import Button from '../UI/Button'
import Input from '../UI/Input'
import { showToast } from '../UI/Toast'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onBackToLogin 
}) => {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{email?: string}>({})
  const [isSuccess, setIsSuccess] = useState(false)

  const { resetPassword, isLoading, error } = useResetPassword()

  const validateForm = () => {
    const newErrors: {email?: string} = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const result = await resetPassword(email)
      if (result.error) {
        showToast.error(result.error.message)
      } else {
        setIsSuccess(true)
        showToast.success('Password reset email sent!')
      }
    } catch (err) {
      showToast.error('Failed to send reset email. Please try again.')
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
          <CheckCircleIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Check Your Email
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent password reset instructions to <span className="font-medium">{email}</span>.
          Please check your email and follow the link to reset your password.
        </p>
        <Button
          onClick={onBackToLogin}
          variant="secondary"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
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
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Reset Your Password
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          required
        />

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
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <Button
          type="button"
          onClick={onBackToLogin}
          variant="ghost"
          className="w-full"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Login
        </Button>
      </form>
    </motion.div>
  )
}

export default ForgotPasswordForm
