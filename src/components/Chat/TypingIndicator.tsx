// ============= src/components/Chat/TypingIndicator.tsx =============
import React from 'react'
import { motion } from 'framer-motion'
import Avatar from '../UI/Avatar'

const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 px-6 py-4"
    >
      <Avatar name="AI" size="sm" />
      <div className="bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full typing-dot"
              animate={{
                y: [-2, 2, -2],
                opacity: [0.4, 1, 0.4]
              }}
                              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            Subspace AI is thinking...
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default TypingIndicator
