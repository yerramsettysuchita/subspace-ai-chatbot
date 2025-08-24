// ============= src/components/Chat/ChatWindow.tsx =============
import React from 'react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Bars3Icon, ShareIcon } from '@heroicons/react/24/outline'
import { GET_CHAT_BY_ID } from '../../lib/queries'
import { SEND_MESSAGE, INSERT_BOT_MESSAGE } from '../../lib/mutations'
import { MESSAGES_SUBSCRIPTION } from '../../lib/subscriptions'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import { showToast } from '../UI/Toast'


interface ChatWindowProps {
  chatId: string | null
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chatId, 
  onToggleSidebar, 
  isSidebarOpen 
}) => {
  const [isTyping, setIsTyping] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Queries and mutations
  const { data: chatData } = useQuery(GET_CHAT_BY_ID, {
    variables: { chatId },
    skip: !chatId
  })

  const { data: messagesData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId
  })

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE)
  const [insertBotMessage] = useMutation(INSERT_BOT_MESSAGE)

  const messages = React.useMemo(() => 
    messagesData?.messages || [], 
    [messagesData?.messages]
  )

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Mock bot responses (enhanced with context awareness)
  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    // Technical/Programming responses
    if (message.includes('react') || message.includes('component')) {
      return `Great question about React! Here's a helpful approach:

\`\`\`jsx
import React, { useState } from 'react'

const ExampleComponent = () => {
  const [state, setState] = useState('')
  
  return (
    <div>
      <h1>Hello from Subspace AI!</h1>
      <p>This is a React component example.</p>
    </div>
  )
}

export default ExampleComponent
\`\`\`

This creates a functional component with state management. Would you like me to explain any specific part?`
    }

    if (message.includes('javascript') || message.includes('js')) {
      return `Here's some JavaScript knowledge for you:

\`\`\`javascript
// Modern JavaScript features
const asyncFunction = async () => {
  try {
    const data = await fetch('/api/data')
    const result = await data.json()
    return result
  } catch (error) {
    console.error('Error:', error)
  }
}

// Array methods
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
const filtered = numbers.filter(n => n > 2)
\`\`\`

JavaScript is incredibly versatile! What specific aspect would you like to explore?`
    }

    if (message.includes('python')) {
      return `Python is fantastic! Here's a useful example:

\`\`\`python
# Python data processing
import pandas as pd
import numpy as np

def process_data(data):
    """Process and analyze data efficiently"""
    df = pd.DataFrame(data)
    
    # Data cleaning
    df_clean = df.dropna()
    
    # Statistical analysis
    summary = df_clean.describe()
    
    return {
        'cleaned_data': df_clean,
        'summary': summary
    }

# Usage example
result = process_data(your_data)
print(result['summary'])
\`\`\`

What Python topic interests you most?`
    }

    // Creative/Personal responses
    if (message.includes('creative') || message.includes('writing')) {
      return `🎨 **Creative Writing Tips from Subspace AI:**

**1. Start with a Hook**
- Begin with an intriguing question
- Use a vivid sensory detail
- Start in the middle of action

**2. Show, Don't Tell**
- Instead of "She was sad" → "Tears traced silent paths down her cheeks"
- Use concrete details and emotions

**3. Character Development**
- Give characters unique voices
- Create believable flaws and strengths
- Let them grow throughout the story

**4. Environment as Character**
- Use setting to reflect mood
- Make locations feel alive
- Weather can enhance emotions

What type of creative writing are you working on? I'd love to help you develop it further!`
    }

    if (message.includes('productivity') || message.includes('tips') || message.includes('advice')) {
      return `⚡ **Productivity Strategies that Actually Work:**

**🎯 The 2-Minute Rule**
If it takes less than 2 minutes, do it now. Don't add it to your todo list.

**🍅 Pomodoro Technique**
- 25 minutes focused work
- 5 minute break
- After 4 cycles, take a 15-30 minute break

**📱 Digital Minimalism**
- Turn off non-essential notifications
- Use website blockers during focus time
- Keep your phone in another room

**🌅 Morning Routine Power**
- Start with your most important task
- Avoid checking emails first thing
- Include some form of movement

**🎨 Energy Management > Time Management**
Schedule demanding tasks when your energy is highest.

What area of productivity would you like to dive deeper into?`
    }

    // Greetings and general responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `👋 **Hello there!** Welcome to Subspace AI!

I'm your intelligent conversation partner, ready to help with:

🛠️ **Technical Stuff**: Programming, web development, debugging
📝 **Creative Projects**: Writing, brainstorming, content creation  
🧠 **Learning**: Explanations, tutorials, concept clarification
💡 **Problem Solving**: Analysis, strategic thinking, decision making
🎯 **Productivity**: Organization, workflow optimization, goal setting

What would you like to explore today? I'm here to make our conversation both helpful and engaging! ✨`
    }

    if (message.includes('how are you') || message.includes('how do you')) {
      return `I'm doing wonderfully, thank you for asking! 🌟

As Subspace AI, I'm constantly processing information and ready to dive into fascinating conversations. I find great satisfaction in helping people solve problems, learn new things, and explore creative ideas.

Right now, I'm particularly excited about:
- Helping with technical challenges
- Discussing innovative solutions  
- Exploring creative projects
- Sharing knowledge and insights

What's on your mind today? I'm genuinely curious about what you're working on or thinking about! 🚀`
    }

    if (message.includes('what can you do') || message.includes('help me with')) {
      return `🚀 **I can help you with tons of things!**

**💻 Technical & Programming:**
- Code review and debugging
- Architecture and design patterns
- Web development (React, Node.js, etc.)
- Database design and optimization
- API development and integration

**🎨 Creative & Content:**
- Writing assistance and editing
- Brainstorming sessions
- Content strategy
- Creative problem solving
- Storytelling techniques

**📚 Learning & Explanation:**
- Complex concept breakdowns
- Tutorial creation
- Research assistance
- Study guides and summaries

**🎯 Strategic Thinking:**
- Project planning
- Decision analysis
- Process optimization
- Goal setting and achievement

**💡 Personal Development:**
- Productivity systems
- Skill development paths
- Career advice
- Time management

Just tell me what you're working on, and I'll adapt my responses to be most helpful for your specific situation! What sounds interesting to you?`
    }

    // Default intelligent response
    const responses = [
      `That's an interesting point about "${userMessage}". Let me think about this...

From my perspective, there are several angles we could explore:

**🔍 Analysis**: I can break down the key components and relationships involved.

**💡 Solutions**: We could brainstorm practical approaches or alternatives.

**🎯 Applications**: I can suggest how this might apply to real-world scenarios.

**🔄 Next Steps**: We can outline actionable items or further exploration areas.

Which direction interests you most? I'm here to dive as deep as you'd like! 🚀`,

      `Great question! You've touched on something that connects to several important concepts.

**🌐 Context**: Understanding the broader implications here
**⚙️ Mechanics**: How the underlying systems work
**🎪 Practical Impact**: What this means for real applications
**🔮 Future Considerations**: Where this might lead

I'd love to explore this further with you. What specific aspect would be most valuable to discuss? 

I can provide detailed explanations, practical examples, or help you apply this to your specific situation. What would be most helpful?`,

      `You know, that reminds me of something fascinating...

**🧠 The deeper question here** might be about the underlying principles at work.

**🔗 There are connections** between what you're asking and several other important areas.

**✨ The practical implications** could be quite significant depending on your context.

I'm curious - what sparked this question? Understanding your perspective would help me give you the most relevant and useful response.

Whether you want a technical deep-dive, practical guidance, or creative exploration, I'm ready to adapt to what works best for you! 🎯`
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = async (content: string, messageType: 'text' | 'code' = 'text') => {
    if (!chatId) return

    try {
      // Send user message
      await sendMessage({
        variables: {
          chatId,
          content,
          messageType
        }
      })

      // Show typing indicator
      setIsTyping(true)

      // Simulate AI processing time (1-3 seconds)
      const delay = Math.random() * 2000 + 1000
      
      setTimeout(async () => {
        try {
          // Generate bot response
          const botResponse = generateBotResponse(content)
          
          // Insert bot message
          await insertBotMessage({
            variables: {
              chatId,
              content: botResponse,
              messageType: 'text'
            }
          })

          setIsTyping(false)
          showToast.success('Response generated!')
        } catch (error) {
          console.error('Error generating bot response:', error)
          setIsTyping(false)
          showToast.error('Failed to generate response')
        }
      }, delay)

    } catch (error) {
      console.error('Error sending message:', error)
      showToast.error('Failed to send message')
      setIsTyping(false)
    }
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
              title="Toggle sidebar"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subspace AI
          </h2>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-900">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="subspace-logo text-2xl font-bold">AI</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Subspace AI
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start a new conversation or select an existing chat from the sidebar. 
              I'm here to help with coding, creativity, learning, and much more!
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              💡 <strong>Pro tip:</strong> Try asking me about programming, creative writing, 
              productivity tips, or any topic you're curious about!
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const chat = chatData?.chats_by_pk

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
              title="Toggle sidebar"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {chat?.title || 'Chat'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Subspace AI
            </p>
          </div>
        </div>

        <button
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          title="Share chat"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-900">
        <AnimatePresence mode="popLayout">
          {messages.map((message: { id: string, content: string, isBot: boolean, timestamp: string, message_type?: 'text' | 'code' }, index: number) => (
            <MessageBubble
              key={message.id}
              message={message}
              index={index}
            />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />

        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full"
          >
            <div className="text-center max-w-md mx-auto p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Start the conversation!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This is the beginning of your chat with Subspace AI. 
                Ask me anything - I'm here to help and learn with you!
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">💻 Technical</div>
                  <div className="text-gray-500 dark:text-gray-400">Code, debugging, architecture</div>
                </div>
                <div className="p-3 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">🎨 Creative</div>
                  <div className="text-gray-500 dark:text-gray-400">Writing, brainstorming, ideas</div>
                </div>
                <div className="p-3 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">📚 Learning</div>
                  <div className="text-gray-500 dark:text-gray-400">Explanations, tutorials, concepts</div>
                </div>
                <div className="p-3 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">🎯 Strategy</div>
                  <div className="text-gray-500 dark:text-gray-400">Planning, decisions, optimization</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={sending || isTyping}
        disabled={!chatId}
      />
    </div>
  )
}

export default ChatWindow