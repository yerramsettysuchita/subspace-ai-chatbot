// ============= src/utils/formatters.ts =============
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    }
    return `${diffInHours}h ago`
  }
  
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  
  return date.toLocaleDateString()
}

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export const formatMessagePreview = (content: string): string => {
  // Remove markdown syntax for preview
  const cleaned = content
    .replace(/```[\s\S]*?```/g, '[Code block]')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\n/g, ' ')
  
  return truncateText(cleaned, 60)
}

export const generateChatTitle = (firstMessage: string): string => {
  const cleaned = firstMessage
    .replace(/[^\w\s]/g, '')
    .trim()
  
  if (cleaned.length <= 30) return cleaned
  
  const words = cleaned.split(' ')
  let title = ''
  
  for (const word of words) {
    if ((title + word).length <= 30) {
      title += (title ? ' ' : '') + word
    } else {
      break
    }
  }
  
  return title || 'New Chat'
}
