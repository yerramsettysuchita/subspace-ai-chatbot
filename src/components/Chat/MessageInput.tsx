// ============= src/components/Chat/MessageInput.tsx =============
import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  PaperClipIcon,
  MicrophoneIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'
import Button from '../UI/Button'
import { showToast } from '../UI/Toast'

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: 'text' | 'code') => void
  isLoading: boolean
  disabled?: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'text' | 'code'>('text')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || isLoading || disabled) return

    onSendMessage(message.trim(), messageType)
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    
    // Auto-detect code blocks
    if (pastedText.includes('```') || pastedText.includes('function') || pastedText.includes('const ') || pastedText.includes('import ')) {
      setMessageType('code')
      showToast.info('Detected code - switched to code mode')
    }
  }

  return (
    <div className="border-t border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Message type selector */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMessageType('text')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              messageType === 'text'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => setMessageType('code')}
            className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
              messageType === 'code'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <CommandLineIcon className="w-3 h-3" />
            Code
          </button>
        </div>

        <div className="flex items-end gap-3">
          {/* Attachment button */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title="Attach file"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                messageType === 'code' 
                  ? "Write your code here..."
                  : "Ask Subspace AI anything..."
              }
              disabled={disabled || isLoading}
              className={`w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                messageType === 'code' ? 'font-mono text-sm' : ''
              }`}
              rows={1}
              style={{ minHeight: '48px' }}
            />
            
            {message.trim() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-2 right-2 text-xs text-gray-400"
              >
                {message.length} chars
              </motion.div>
            )}
          </div>

          {/* Voice input button */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            title="Voice input"
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>

          {/* Send button */}
          <Button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            loading={isLoading}
            className="!p-3"
            title="Send message (Enter)"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick suggestions */}
        {!message && (
          <div className="flex flex-wrap gap-2">
            {[
              "Explain quantum computing",
              "Write a React component",
              "Help me with Python",
              "Creative writing tips"
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setMessage(suggestion)}
                className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-600 rounded-full hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}

export default MessageInput
