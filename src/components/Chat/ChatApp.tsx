// ============= src/components/Chat/ChatApp.tsx =============
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'


const ChatApp: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-10"
      >
        <ChatSidebar
          selectedChatId={selectedChatId}
          onChatSelect={setSelectedChatId}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </motion.div>

      <div className="flex-1 flex flex-col">
        <ChatWindow
          chatId={selectedChatId}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </div>
  )
}

export default ChatApp
