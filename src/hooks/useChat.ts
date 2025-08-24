// ============= src/hooks/useChat.ts =============
import { useState, useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_CHAT, UPDATE_CHAT, DELETE_CHAT } from '../lib/mutations'
import { GET_USER_CHATS } from '../lib/queries'
import { showToast } from '../components/UI/Toast'
import { Chat } from '../types/chat'
import { generateChatTitle } from '../utils/formatters'

export const useChat = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  
  const { data, loading, refetch } = useQuery(GET_USER_CHATS, {
    variables: {
      userId: (window as Window & typeof globalThis & { userId?: string }).userId // TODO: Get user ID from proper auth context
    }
  })
  const [createChatMutation, { loading: creating }] = useMutation(CREATE_CHAT)
  const [updateChatMutation, { loading: updating }] = useMutation(UPDATE_CHAT)
  const [deleteChatMutation, { loading: deleting }] = useMutation(DELETE_CHAT)

  const chats: Chat[] = data?.chats || []

  const createChat = useCallback(async (data?: { title?: string }): Promise<string | null> => {
    try {
      const title = data?.title || `New Chat ${new Date().toLocaleTimeString()}`
      
      const result = await createChatMutation({
        variables: {
          title
        }
      })
      
      if (result.data?.insert_chats_one) {
        const newChatId = result.data.insert_chats_one.id
        setSelectedChatId(newChatId)
        showToast.success('New chat created!')
        await refetch()
        return newChatId
      }
      
      return null
    } catch (error) {
      console.error('Error creating chat:', error)
      showToast.error('Failed to create chat')
      return null
    }
  }, [createChatMutation, refetch])

  const updateChat = useCallback(async (chatId: string, updates: Partial<Chat>): Promise<boolean> => {
    try {
      await updateChatMutation({
        variables: {
          chatId,
          title: updates.title
        }
      })
      
      showToast.success('Chat updated!')
      await refetch()
      return true
    } catch (error) {
      console.error('Error updating chat:', error)
      showToast.error('Failed to update chat')
      return false
    }
  }, [updateChatMutation, refetch])

  const deleteChat = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      await deleteChatMutation({
        variables: { chatId }
      })
      
      if (selectedChatId === chatId) {
        setSelectedChatId(null)
      }
      
      showToast.success('Chat deleted')
      await refetch()
      return true
    } catch (error) {
      console.error('Error deleting chat:', error)
      showToast.error('Failed to delete chat')
      return false
    }
  }, [deleteChatMutation, refetch, selectedChatId])

  const selectChat = useCallback((chatId: string | null) => {
    setSelectedChatId(chatId)
  }, [])

  const createChatFromMessage = useCallback(async (message: string): Promise<string | null> => {
    const title = generateChatTitle(message)
    return await createChat({ title })
  }, [createChat])

  return {
    chats,
    selectedChatId,
    loading,
    creating,
    updating,
    deleting,
    createChat,
    updateChat,
    deleteChat,
    selectChat,
    createChatFromMessage,
    refetch
  }
}
