// ============= README.md =============
# 🚀 Subspace AI Chatbot

A modern, intelligent chatbot application built with React, TypeScript, and Nhost.

## ✨ Features

- **🔐 Authentication**: Email signup/login with verification
- **💬 Real-time Chat**: Live messaging with WebSocket subscriptions  
- **🤖 AI Responses**: Intelligent context-aware bot responses
- **🎨 Beautiful UI**: Modern design with smooth animations
- **📱 Responsive**: Works perfectly on all devices
- **🌙 Dark Mode**: Auto-switching themes
- **💾 Data Persistence**: All conversations saved to database
- **🔄 Real-time Updates**: Live message synchronization
- **📤 Chat Sharing**: Share conversations via email/WhatsApp
- **👤 Profile Management**: User profiles with customization

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Nhost (PostgreSQL + Hasura GraphQL)
- **Authentication**: Nhost Auth
- **Real-time**: GraphQL Subscriptions
- **Deployment**: Netlify

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd subspace-ai-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env.local
VITE_NHOST_SUBDOMAIN=your-subdomain
VITE_NHOST_REGION=your-region
VITE_APP_NAME=Subspace AI
VITE_APP_URL=http://localhost:5173
```

4. Start development server:
```bash
npm run dev
```

## 📦 Deployment

### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
- Drag and drop the `dist` folder to Netlify
- Or connect your GitHub repository to Netlify

3. Set environment variables in Netlify dashboard

## 🗄️ Database Setup

1. Create a Nhost project at [nhost.io](https://nhost.io)
2. Execute the database schema in Hasura Console
3. Set up table permissions for the `user` role
4. Configure GraphQL endpoints

## 🎯 Usage

1. **Sign Up**: Create a new account with email verification
2. **Login**: Access your account
3. **Start Chatting**: Create a new chat and start conversations
4. **Explore Features**: Try different message types, code snippets, and topics
5. **Share**: Share interesting conversations with others

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

### Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Chat/           # Chat interface components
│   ├── UI/             # Reusable UI components
│   └── Animations/     # Animation components
├── hooks/              # Custom React hooks
├── lib/                # Configuration and utilities
│   ├── nhost.ts        # Nhost configuration
│   ├── apollo.ts       # Apollo GraphQL client
│   ├── queries.ts      # GraphQL queries
│   ├── mutations.ts    # GraphQL mutations
│   └── subscriptions.ts# GraphQL subscriptions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Additional styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Nhost for the amazing backend-as-a-service
- Hasura for the GraphQL engine
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
