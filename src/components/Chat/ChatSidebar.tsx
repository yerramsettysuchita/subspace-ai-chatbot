// ============= src/components/Chat/ChatSidebar.tsx =============
import React from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserData, useSignOut } from '@nhost/react'
import { 
  PlusIcon, 
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Button from '../UI/Button'
import Avatar from '../UI/Avatar'
import { GET_USER_CHATS } from '../../lib/queries'
import { CREATE_CHAT } from '../../lib/mutations'
import { showToast } from '../UI/Toast'
import { Chat } from '../../types'

interface ChatSidebarProps {
  selectedChatId: string | null
  onChatSelect: (chatId: string) => void
  isOpen: boolean
  onToggle: () => void
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedChatId,
  onChatSelect,

  onToggle
}) => {
  const user = useUserData()
  const { signOut } = useSignOut()
  const { data, loading, refetch } = useQuery(GET_USER_CHATS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  })
  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT)

  const handleNewChat = async () => {
    if (!user?.id) {
      showToast.error('User not authenticated')
      return
    }
    try {
      const result = await createChat({
        variables: {
          title: `New Chat ${new Date().toLocaleTimeString()}`,
          userId: user.id
        }
      })
      if (result.data?.insert_chats_one) {
        onChatSelect(result.data.insert_chats_one.id)
        showToast.success('New chat created!')
        refetch()
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
      showToast.error('Failed to create new chat')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      showToast.success('Signed out successfully')
    } catch (error) {
      console.error('Failed to sign out:', error)
      showToast.error('Failed to sign out')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="w-80 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Subspace AI
          </h1>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 md:hidden"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <Button
          onClick={handleNewChat}
          loading={creating}
          className="w-full"
          variant="primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse mb-3">
                <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-dark-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {data?.chats?.map((chat: Chat, index: number) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => onChatSelect(chat.id)}
                className={`p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 ${
                  selectedChatId === chat.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-r-primary-500'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {chat.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(chat.updated_at)}
                    </p>
                    {chat.message_count > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {chat.message_count} messages
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {data?.chats?.length === 0 && !loading && (
          <div className="p-8 text-center">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              No chats yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start a new conversation to get began!
            </p>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName || user?.email}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              title="Settings"
            >
              <Cog6ToothIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatSidebar
