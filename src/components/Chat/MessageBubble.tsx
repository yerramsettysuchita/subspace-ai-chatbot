// ============= src/components/Chat/MessageBubble.tsx =============
import React from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { 
  ClipboardIcon, 
  CheckIcon,
  HandThumbUpIcon as ThumbUpIcon,
  HandThumbDownIcon as ThumbDownIcon 
} from '@heroicons/react/24/outline'
import Avatar from '../UI/Avatar'

import { showToast } from '../UI/Toast'

import { ChatMessage } from '../../types/chat'

interface MessageBubbleProps {
  message: ChatMessage;
  index: number
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const [copied, setCopied] = React.useState(false)
  
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      showToast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast.error('Failed to copy')
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }

  const isBot = message.isBot
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`flex items-start gap-3 px-6 py-4 group ${
        isBot ? 'justify-start' : 'justify-end'
      }`}
    >
      {isBot && <Avatar name="AI" size="sm" />}
      
      <div
        className={`max-w-[70%] ${
          isBot
            ? 'bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-2xl rounded-bl-md text-gray-900 dark:text-white'
            : 'bg-primary-600 text-white rounded-2xl rounded-br-md'
        } px-4 py-3 shadow-sm relative`}
      >
        {message.message_type === 'code' ? (
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code className="language-javascript">{message.content}</code>
            </pre>
            <button
              onClick={() => handleCopy(message.content)}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-black/20 rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <ClipboardIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                code: {
                  // @ts-ignore - ReactMarkdown types are not fully compatible
                  component: ({
                    inline,
                    children,
                    ...props
                  }: {
                    inline?: boolean;
                    children: React.ReactNode;
                    [key: string]: unknown;
                  }) => {
                  if (!inline) {
                    // Block code
                    return (
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-4">
                          <code {...props}>{children}</code>
                        </pre>
                        <button
                          onClick={() => handleCopy(String(children))}
                          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-black/20 rounded transition-colors"
                          title="Copy code"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  } else {
                    // Inline code
                    return (
                      <code 
                        className="bg-gray-100 dark:bg-dark-600 px-1.5 py-0.5 rounded text-sm font-mono" 
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }
                },
                pre: ({ children }) => <>{children}</>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                /* eslint-disable */
                li: ({ children }) => <li className="mb-1">{children}</li>,
                /* eslint-enable */
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
          <span>{formatTime(message.timestamp)}</span>
          
          {/* Message actions - show on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
            <button
              onClick={() => handleCopy(message.content)}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              title="Copy"
            >
              <ClipboardIcon className="w-3 h-3" />
            </button>
            {isBot && (
              <>
                <button
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                  title="Like"
                >
                  <ThumbUpIcon className="w-3 h-3" />
                </button>
                <button
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                  title="Dislike"
                >
                  <ThumbDownIcon className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {!isBot && <Avatar name="You" size="sm" />}
    </motion.div>
  )
}

export default MessageBubble