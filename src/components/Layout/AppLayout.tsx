// ============= src/components/Layout/AppLayout.tsx =============
import React from 'react'
import { motion } from 'framer-motion'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 dark:bg-dark-900"
    >
      {children}
    </motion.div>
  )
}

export default AppLayout
