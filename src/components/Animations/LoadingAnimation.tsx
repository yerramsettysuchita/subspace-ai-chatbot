// ============= src/components/Animations/LoadingAnimation.tsx =============
import React from 'react'
import { motion } from 'framer-motion'

interface LoadingAnimationProps {
  message?: string
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        className="mt-4 text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  )
}

export default LoadingAnimation
