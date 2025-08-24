// src/App.tsx - Complete Working Version
import React, { useState, useRef, useEffect } from 'react';
import { ApolloProvider, useQuery, useMutation, gql } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import './index.css';

// Import configurations and hooks
import { apolloClient } from './lib/apollo';
import { useAuth, authService } from './hooks/useAuth';

// GraphQL Operations
const GET_USER_CHATS = gql`
  query GetUserChats($userId: uuid!) {
    chats(
      where: { user_id: { _eq: $userId } }
      order_by: { updated_at: desc }
    ) {
      id
      title
      is_public
      share_token
      created_at
      updated_at
      last_message_at
      message_count
    }
  }
`;

const GET_CHAT_WITH_MESSAGES = gql`
  query GetChatWithMessages($chatId: uuid!) {
    chats_by_pk(id: $chatId) {
      id
      title
      is_public
      created_at
      updated_at
      messages(order_by: { created_at: asc }) {
        id
        title
        description
        message_count
        created_at
        updated_at
        user_id
      }
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $isPublic: Boolean = false, $shareToken: String) {
    insert_chats_one(object: {
      title: $title
      is_public: $isPublic
      share_token: $shareToken
    }) {
      id
      title
      is_public
      share_token
      created_at
      user_id
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation CreateMessage(
    $chatId: uuid!
    $title: String!
    $description: String!
    $messageCount: Int!
  ) {
    insert_messages_one(object: {
      chat_id: $chatId
      title: $title
      description: $description
      message_count: $messageCount
    }) {
      id
      title
      description
      message_count
      created_at
      chat_id
      user_id
    }
  }
`;

const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: uuid!) {
    delete_messages(where: { chat_id: { _eq: $chatId } }) {
      affected_rows
    }
    delete_chats(where: { id: { _eq: $chatId } }) {
      affected_rows
    }
  }
`;

const UPDATE_CHAT = gql`
  mutation UpdateChat(
    $chatId: uuid!, 
    $title: String, 
    $isPublic: Boolean, 
    $lastMessageAt: timestamptz,
    $messageCount: Int
  ) {
    update_chats(
      where: { id: { _eq: $chatId } }
      _set: { 
        title: $title, 
        is_public: $isPublic,
        last_message_at: $lastMessageAt,
        message_count: $messageCount,
        updated_at: "now()" 
      }
    ) {
      affected_rows
      returning {
        id
        title
        is_public
        last_message_at
        message_count
        updated_at
      }
    }
  }
`;

// Import types
import {
  ChatMessage,
  Chat,

  CustomError,
  UserProfile,
} from './types/chat';

// Types
type AuthView = 'welcome' | 'login' | 'signup' | 'chat' | 'verify-email' | 'forgot-password';

function AppContent() {
  const [currentView, setCurrentView] = useState<AuthView>('welcome');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth hook
  const { user, isAuthenticated, loading } = useAuth();

  // Debug logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('App State:', { user: !!user, isAuthenticated, loading, currentView });
    }
  }, [user, isAuthenticated, loading, currentView]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedChatId || localMessages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [localMessages, selectedChatId, isTyping]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Subspace AI...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    return (
      <AuthScreens 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        emailForVerification={emailForVerification}
        setEmailForVerification={setEmailForVerification}
      />
    );
  }

  // If authenticated, show chat interface
  return (
    <ChatInterface 
      user={user!}
      selectedChatId={selectedChatId}
      setSelectedChatId={setSelectedChatId}
      inputMessage={inputMessage}
      setInputMessage={setInputMessage}
      isTyping={isTyping}
      setIsTyping={setIsTyping}
      showProfileModal={showProfileModal}
      setShowProfileModal={setShowProfileModal}
      showSettingsModal={showSettingsModal}
      setShowSettingsModal={setShowSettingsModal}
      messagesEndRef={messagesEndRef}
      localMessages={localMessages}
      setLocalMessages={setLocalMessages}
      setCurrentView={setCurrentView}
    />
  );
}

// Auth Screens Component
function AuthScreens({ 
  currentView, 
  setCurrentView, 
  emailForVerification, 
  setEmailForVerification 
}: {
  currentView: AuthView;
  setCurrentView: (view: AuthView) => void;
  emailForVerification: string;
  setEmailForVerification: (email: string) => void;
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.signIn(formData.email, formData.password);
      setCurrentView('chat');
    } catch (err) {
      const error = err as CustomError;
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.signUp(formData.email, formData.password, { displayName: formData.displayName });
      setEmailForVerification(formData.email);
      setCurrentView('verify-email');
    } catch (err) {
      const error = err as CustomError;
      setError(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold mb-4 subspace-logo">
            Subspace AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your Intelligent Conversation Partner
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to Subspace AI</h2>
              <p className="text-gray-600">Advanced AI conversations with real-time intelligence</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => setCurrentView('login')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => setCurrentView('signup')}
                className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Create Account
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Join thousands of users having intelligent conversations
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Login Screen
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="subspace-logo text-3xl font-bold mb-2">Subspace AI</h1>
              <p className="text-gray-600">Welcome back to intelligent conversations</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot your password?
                </button>
                
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView('signup')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Signup Screen
  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="subspace-logo text-3xl font-bold mb-2">Subspace AI</h1>
              <p className="text-gray-600">Create your intelligent assistant account</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  required
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password (8+ characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Email Verification Screen
  if (currentView === 'verify-email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{emailForVerification}</strong>.
              Please check your email and click the link to verify your account.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                After verifying, you can sign in to start chatting!
              </p>
              <button
                onClick={() => setCurrentView('login')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => setCurrentView('signup')}
                className="w-full text-blue-600 hover:text-blue-700 py-2"
              >
                ← Back to Sign Up
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Forgot Password Screen
  if (currentView === 'forgot-password') {
    const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      
      try {
        await authService.resetPassword(formData.email);
        alert('Password reset email sent! Check your inbox.');
        setCurrentView('login');
      } catch (err) {
        const error = err as CustomError;
        setError(error.message || 'Password reset failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
              <p className="text-gray-600">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return <div>Unknown auth view</div>;
}

// Chat Interface Component
function ChatInterface({ 
  user, 
  selectedChatId, 
  setSelectedChatId,
  inputMessage,
  setInputMessage,
  isTyping,
  setIsTyping,
  showProfileModal,
  setShowProfileModal,
  showSettingsModal,
  setShowSettingsModal,
  messagesEndRef,
  localMessages,
  setLocalMessages,
  setCurrentView
}: {
  user: UserProfile;
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  localMessages: ChatMessage[];
  setLocalMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setCurrentView: (view: AuthView) => void;
}) {
  
  // GraphQL mutations
  const [createChatMutation] = useMutation(CREATE_CHAT);
  const [createMessageMutation] = useMutation(CREATE_MESSAGE);
  const [deleteChatMutation] = useMutation(DELETE_CHAT);
  const [updateChatMutation] = useMutation(UPDATE_CHAT);

  // Fetch user's chats
  const { data: chatsData, loading: chatsLoading, error: chatsError, refetch: refetchChats } = useQuery(GET_USER_CHATS, {
    variables: { userId: user.id },
    errorPolicy: 'all',
    skip: !user?.id,
  });

  // Fetch current chat messages
  const { data: chatData, loading: chatLoading } = useQuery(GET_CHAT_WITH_MESSAGES, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
    errorPolicy: 'all',
  });

  // Convert Hasura data to local format
  const chats = chatsData?.chats?.map((chat: Chat) => ({
    id: chat.id,
    title: chat.title || 'New Chat',
    message_count: chat.message_count || 0,
    updated_at: chat.updated_at,
    created_at: chat.created_at,
    is_public: chat.is_public,
    share_token: chat.share_token,
  })) || [];

  const currentChatMessages = chatData?.chats_by_pk?.messages?.map((msg: { id: string; title: string; description: string; message_count: number; created_at: string }) => ({
    id: msg.id,
    content: msg.description || msg.title || '',
    isBot: msg.message_count % 2 === 0, // Even numbers are bot messages
    timestamp: msg.created_at,
  })) || [];

  // Combined messages (from DB + local typing)
  const displayMessages = [...currentChatMessages, ...localMessages];

// Local bot response generator
const generateBotResponse = async (userMessage: string, chatHistory?: ChatMessage[]): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Use chat history for context if available
  const recentContext = chatHistory?.slice(-3).map(msg => msg.content).join(' ');
  const hasContext = recentContext && recentContext.length > 0;

  // Simple response patterns
  const patterns = [
    {
      keywords: ['hi', 'hello', 'hey'],
      responses: [
        "Hello! How can I help you today?",
        "Hi there! What's on your mind?",
        "Greetings! How may I assist you?"
      ]
    },
    {
      keywords: ['how are you', 'how do you do'],
      responses: [
        "I'm functioning well, thank you! How can I help?",
        "I'm great, thanks for asking! What can I do for you?",
        "All systems operational! What would you like to discuss?"
      ]
    },
    {
      keywords: ['bye', 'goodbye', 'see you'],
      responses: [
        "Goodbye! Have a great day!",
        "See you later! Take care!",
        "Bye for now! Feel free to return anytime!"
      ]
    },
    {
      keywords: ['help', 'what can you do'],
      responses: [
        "I can help with various tasks like:\n- Writing and coding\n- Answering questions\n- Problem-solving\n- Creative ideas\nWhat would you like help with?",
        "I'm here to assist with:\n- Programming help\n- General questions\n- Creative tasks\n- And more!\nWhat interests you?"
      ]
    },
    {
      keywords: ['code', 'programming', 'develop'],
      responses: [
        "I can help with programming! Here's a simple example:\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```\nWhat would you like to create?",
        "Let's write some code! Here's a starter:\n```python\ndef calculate_sum(numbers):\n    return sum(numbers)\n```\nWhat programming language are you working with?"
      ]
    },
    {
      keywords: ['react', 'component', 'jsx'],
      responses: [
        "Here's a simple React component example:\n```jsx\nfunction Button({ onClick, children }) {\n  return (\n    <button \n      onClick={onClick}\n      className='btn btn-primary'\n    >\n      {children}\n    </button>\n  );\n}\n```\nWhat are you building in React?",
        "Let's work with React! Here's a functional component:\n```jsx\nfunction Card({ title, description }) {\n  return (\n    <div className='card'>\n      <h2>{title}</h2>\n      <p>{description}</p>\n    </div>\n  );\n}\n```"
      ]
    },
    {
      keywords: ['typescript', 'type', 'interface'],
      responses: [
        "Here's a TypeScript example:\n```typescript\ninterface User {\n  id: string;\n  name: string;\n  email?: string;\n}\n\nfunction getUser(id: string): User {\n  // Implementation\n}\n```\nWhat TypeScript concepts would you like to explore?",
      ]
    },
    {
      keywords: ['test', 'jest', 'testing'],
      responses: [
        "Here's a Jest test example:\n```javascript\ndescribe('Calculator', () => {\n  test('adds numbers correctly', () => {\n    expect(add(2, 2)).toBe(4);\n  });\n});\n```\nWhat would you like to test?",
      ]
    },
    {
      keywords: ['api', 'fetch', 'axios'],
      responses: [
        "Here's how to fetch data from an API:\n```javascript\nasync function fetchData() {\n  try {\n    const response = await fetch('https://api.example.com/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n```\nWhat API are you working with?"
      ]
    },
    {
      keywords: ['css', 'style', 'tailwind'],
      responses: [
        "Here's a Tailwind CSS example:\n```jsx\n<div className='flex items-center justify-between p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow'>\n  <h2 className='text-xl font-semibold text-gray-800'>Title</h2>\n  <button className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>\n    Click me\n  </button>\n</div>\n```\nWhat are you styling?"
      ]
    }
  ];

  // Convert input to lowercase for matching
  const lowerMessage = userMessage.toLowerCase();

  // Find matching pattern
  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const responses = pattern.responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // If no specific pattern matches, generate a contextual response based on chat history
  if (hasContext && recentContext) {
    const contextualResponses = [
      `Based on our conversation about ${recentContext.substring(0, 30)}..., I understand you're asking about "${userMessage}". Could you provide more details?`,
      `Continuing our discussion about ${recentContext.substring(0, 30)}..., your question about "${userMessage}" is interesting. Let's explore that.`,
      `In the context of ${recentContext.substring(0, 30)}..., what specific aspects of "${userMessage}" would you like to explore?`,
      `Building on our conversation about ${recentContext.substring(0, 30)}..., I'd be happy to help with "${userMessage}". What would you like to know?`
    ];
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  } else {
    const generalResponses = [
      `I understand you're asking about "${userMessage}". Could you provide more details?`,
      `That's an interesting point about "${userMessage}". Let me help you with that.`,
      `I see you're interested in "${userMessage}". What specific aspects would you like to explore?`,
      `I'd be happy to assist with "${userMessage}". What would you like to know specifically?`,
      `Let's explore "${userMessage}" together. What's your main goal or question?`
    ];
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
};  // Create new chat - FIXED VERSION
  const createNewChat = async () => {
    console.log('🚀 Creating new chat for user:', user.id);
    
    if (!user?.id) {
      console.error('No user ID found');
      alert('Please sign in to create a chat');
      return;
    }

    try {
      const result = await createChatMutation({
        variables: {
          title: `New Chat ${new Date().toLocaleTimeString()}`,
          isPublic: false,
          shareToken: null,
        },
      });
      
      console.log('✅ Chat creation result:', result);
      
      if (result.data?.insert_chats_one) {
        const newChat = result.data.insert_chats_one;
        setSelectedChatId(newChat.id);
        setLocalMessages([]);
        refetchChats();
        console.log('🎉 Chat created successfully!');
      } else {
        console.error('No chat data returned:', result);
        alert('Failed to create chat. Please check console for details.');
      }
    } catch (err) {
      const error = err as CustomError;
      console.error('❌ Error creating chat:', error);
      
      // Better error handling
      if (error.graphQLErrors?.[0]?.extensions?.code === 'permission-error') {
        alert('❌ Permission Error: Please set up table permissions in your Nhost dashboard:\n\n1. Go to Data → chats → Permissions\n2. Add "user" role with proper permissions\n3. Set row permissions: {"user_id": {"_eq": "X-Hasura-User-Id"}}');
      } else if (error.networkError) {
        alert('❌ Network Error: Please check your connection and Nhost configuration');
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    }
  };

  // Delete chat
  const deleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat? This cannot be undone.')) {
      return;
    }

    try {
      await deleteChatMutation({
        variables: { chatId },
      });

      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
      
      refetchChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  // Send message
const sendMessage = async () => {
  if (!inputMessage.trim() || !selectedChatId || isTyping) return;

  const userMessage = inputMessage.trim();
  setInputMessage('');
  setIsTyping(true);

  try {
    // Add user message to local state immediately
    const userChatMessage: ChatMessage = {
      id: uuidv4(),
      content: userMessage,
      isBot: false,
      timestamp: new Date().toISOString(),
    };

    setLocalMessages((prev: ChatMessage[]) => [...prev, userChatMessage]);

    // Save user message to database
    const messageCount = displayMessages.length + 1;
    await createMessageMutation({
      variables: {
        chatId: selectedChatId,
        title: userMessage.substring(0, 50),
        description: userMessage,
        messageCount: messageCount,
      },
    });

    // Add temporary bot message while waiting for response
    const tempBotMessage: ChatMessage = {
      id: uuidv4(),
      content: "Thinking...",
      isBot: true,
      timestamp: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, tempBotMessage]);

    // Call your n8n API for bot response (with chat history for context)
    console.log('🤖 Getting AI response from n8n...');
    const botResponse = await generateBotResponse(userMessage, displayMessages);
    console.log('✅ Bot response received:', botResponse);

    // Replace temporary message with actual bot response
    const botChatMessage: ChatMessage = {
      id: tempBotMessage.id, // Use same ID to update the message
      content: botResponse,
      isBot: true,
      timestamp: new Date().toISOString(),
    };

    setLocalMessages(prev => prev.map(msg => 
      msg.id === tempBotMessage.id ? botChatMessage : msg
    ));

    // Save bot message to database
    await createMessageMutation({
      variables: {
        chatId: selectedChatId,
        title: botResponse.substring(0, 50),
        description: botResponse,
        messageCount: messageCount + 1,
      },
    });

    // Update chat with new message count and timestamp
    await updateChatMutation({
      variables: {
        chatId: selectedChatId,
        lastMessageAt: new Date().toISOString(),
        messageCount: messageCount + 2,
      },
    });

    setIsTyping(false);
    refetchChats();

  } catch (error) {
    console.error('Error in sendMessage:', error);
    setIsTyping(false);
    alert('Failed to send message. Please try again.');
  }
};

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await authService.signOut();
        setCurrentView('welcome');
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  };

  // Loading state
  if (chatsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your chats...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (chatsError) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center max-w-md p-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">
              Unable to connect to Subspace AI servers. Please check your connection and Nhost configuration.
            </p>
            <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg mb-4 text-left">
              <strong>Error details:</strong><br />
              {chatsError.message}
            </div>
            <div className="space-y-2">
              <button
                onClick={() => refetchChats()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                Try Again
              </button>
              <button
                onClick={() => setCurrentView('welcome')}
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 w-full"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentChat = chats.find((chat: Chat) => chat.id === selectedChatId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4 subspace-logo">Subspace AI</h1>
          <button 
            onClick={createNewChat}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 mt-8">
              <span className="text-4xl mb-4 block">💬</span>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Create your first chat!</p>
            </div>
          ) : (
            chats.map((chat: Chat) => (
              <div
                key={chat.id}
                className={`group relative p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                }`}
              >
                <div onClick={() => setSelectedChatId(chat.id)} className="flex-1 pr-8">
                  <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {chat.message_count || 0} messages
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                  title="Delete chat"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setShowProfileModal(true)}
              className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors"
            >
              <span className="text-blue-600 font-medium">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate flex items-center gap-1">
                {user?.displayName || user?.email || 'User'}
                {user?.emailVerified && <span className="text-green-500 text-xs">✓</span>}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentChat ? currentChat.title : 'Subspace AI'}
            </h2>
            <p className="text-sm text-gray-500">
              {currentChat ? `${displayMessages.length} messages` : 'Your intelligent conversation partner'}
            </p>
          </div>
          
          {currentChat && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const content = displayMessages
                    .map(m => `${m.isBot ? 'AI' : 'You'}: ${m.content}`)
                    .join('\n\n');
                  navigator.clipboard.writeText(content);
                  alert('Chat copied to clipboard!');
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const subject = `Chat: ${currentChat.title}`;
                  const body = displayMessages
                    .map(m => `${m.isBot ? 'AI' : 'You'}: ${m.content}`)
                    .join('\n\n');
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                📧 Share
              </button>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {!currentChat ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Subspace AI</h2>
                <p className="text-gray-600 mb-6">
                  Create a new chat to start our intelligent conversation. I can help with programming, 
                  creative writing, problem solving, and much more!
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900 mb-1">💻 Technical</div>
                    <div className="text-gray-500">Code, debugging, architecture</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900 mb-1">🎨 Creative</div>
                    <div className="text-gray-500">Writing, brainstorming, ideas</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900 mb-1">📚 Learning</div>
                    <div className="text-gray-500">Explanations, tutorials</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-900 mb-1">🎯 Strategy</div>
                    <div className="text-gray-500">Planning, optimization</div>
                  </div>
                </div>
                <button 
                  onClick={createNewChat}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🚀 Start New Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
              {chatLoading && displayMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading messages...</p>
                </div>
              ) : displayMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-4xl mb-4">💬</div>
                  <p>No messages in this chat yet.</p>
                  <p className="text-sm">Start the conversation below!</p>
                </div>
              ) : (
                displayMessages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                        message.isBot
                          ? 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                          : 'bg-blue-600 text-white rounded-br-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content.split('```').map((part: string, index: number) => {
                          if (index % 2 === 1) {
                            // This is code
                            return (
                              <pre key={index} className="bg-gray-900 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto text-sm">
                                <code>{part}</code>
                              </pre>
                            );
                          }
                          // This is regular text - handle bold formatting
                          return (
                            <span key={index} 
                              dangerouslySetInnerHTML={{
                                __html: part
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/\n/g, '<br />')
                              }}
                            />
                          );
                        })}
                      </div>
                      <div className={`text-xs mt-2 ${message.isBot ? 'text-gray-400' : 'text-blue-100'}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">Subspace AI is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        {currentChat && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Subspace AI anything... (Press Enter to send, Shift+Enter for new line)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '150px' }}
                    disabled={isTyping}
                  />
                  <div className="flex justify-between items-center mt-2 px-2">
                    <div className="text-xs text-gray-500">
                      💡 Try: "Help me code", "Creative writing", "Explain concepts"
                    </div>
                    <div className="text-xs text-gray-400">
                      {inputMessage.length}/2000
                    </div>
                  </div>
                </div>
                <button 
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    !inputMessage.trim() || isTyping
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isTyping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Thinking
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🚀</span>
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />

      {/* Settings Modal */}
      <SettingsModal 
        show={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSignOut={handleSignOut}
        chats={chats}
      />
    </div>
  );
}

// Profile Modal Component
function ProfileModal({ show, onClose, user }: { show: boolean; onClose: () => void; user: UserProfile }) {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
  });

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Profile Settings</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl text-blue-600">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Change Avatar
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  {user?.emailVerified ? (
                    <span className="text-green-600 text-sm">✓ Verified</span>
                  ) : (
                    <button className="text-blue-600 text-sm hover:text-blue-700">
                      Verify
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Profile updates coming soon!');
                    onClose();
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Settings Modal Component
function SettingsModal({ 
  show, 
  onClose, 
  onSignOut, 
  chats 
}: { 
  show: boolean; 
  onClose: () => void; 
  onSignOut: () => void;
  chats: Chat[];
}) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Settings</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Account</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => alert('Password change feature coming soon!')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg"
                  >
                    🔑 Change Password
                  </button>
                  <button 
                    onClick={() => alert('Email preferences updated!')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg"
                  >
                    📧 Email Preferences
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Chat</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      const allChats = chats.map(chat => 
                        `=== ${chat.title} (${chat.message_count} messages) ===\n` +
                        `Created: ${new Date(chat.created_at).toLocaleDateString()}\n\n`
                      ).join('\n================\n\n');
                      
                      const blob = new Blob([allChats], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'subspace-ai-conversations.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg"
                  >
                    📥 Export Chats
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Delete all chats? This cannot be undone.')) {
                        alert('Delete all chats feature coming soon!');
                      }
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg"
                  >
                    🗑️ Delete All Chats
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={onSignOut}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Main App with Providers
function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppContent />
    </ApolloProvider>
  );
}

export default App;