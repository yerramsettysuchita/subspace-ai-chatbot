// ============= src/components/UI/Toast.tsx =============
import React from 'react'
import toast, { Toaster } from 'react-hot-toast'

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast(message, { icon: '⚠️' }),
  info: (message: string) => toast(message, { icon: 'ℹ️' })
}

const ToastContainer: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--toast-text)',
          border: '1px solid var(--toast-border)',
          borderRadius: '8px',
          fontSize: '14px',
          padding: '12px 16px',
          maxWidth: '400px'
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff'
          }
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff'
          }
        }
      }}
    />
  )
}

export default ToastContainer
