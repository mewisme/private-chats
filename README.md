# Private Chats - Anonymous Chat Application with AI

## 🚀 Project Overview

**Private Chats** is a dual-mode chat application that offers both anonymous 1-on-1 conversations with strangers and AI-powered chat experiences. Built with modern web technologies, it features a clean, monochrome design inspired by Vercel's aesthetic and provides seamless chatting experiences whether with humans or AI.

**Version: 0.4.0** - Now with AI Chat Integration!

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Zustand** - Lightweight state management
- **Framer Motion** - Smooth animations

### Backend & Database
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase SDK** - Database operations and real-time updates
- **Gemini API** - AI-powered chat responses

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **pnpm** - Package manager
- **Turbopack** - Fast development bundler

## 🌟 Key Features

### Dual-Mode Chat Experience
- **🤖 AI Chat Mode**: Interactive conversations with AI assistant
- **👥 Anonymous Stranger Chat**: Real-time chat with random strangers
- **⚙️ Settings Toggle**: Switch between modes easily

### Core Functionality
- **Anonymous Matching**: Find random strangers to chat with
- **AI Assistant**: Powered by Gemini for intelligent conversations
- **Real-time Messaging**: Instant message delivery using Firestore
- **Room Management**: Automatic room creation and cleanup
- **Persistent Sessions**: Client ID-based session management

### User Experience
- **Clean Monochrome Design**: Black/white/gray color scheme
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Works on all devices
- **Auto-focus Input**: Seamless typing experience
- **Loading States**: Visual feedback during operations
- **Smart Mode Detection**: Contextual UI based on chat type

### Technical Features
- **Real-time Updates**: Live message synchronization
- **AI Integration**: Seamless Gemini API integration
- **Automatic Cleanup**: Rooms and messages are cleaned up when users leave
- **Error Handling**: Graceful error management with toast notifications
- **Type Safety**: Full TypeScript implementation
- **State Management**: Intelligent message storage for both modes

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (Find Stranger/AI Chat)
│   ├── layout.tsx         # Root layout
│   ├── chat/[roomId]/     # Dynamic chat room routes
│   ├── chat/ai/           # AI chat route
│   └── api/ai/            # AI chat API endpoint
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── chat/             # Chat-specific components
│   └── common/           # Settings and shared components
├── lib/                  # Core utilities
│   ├── firebase.ts       # Firebase configuration
│   ├── room.ts           # Room management logic
│   └── message.ts        # Message handling
├── hooks/                # Custom React hooks
│   ├── use-cache-store.ts # State management
│   ├── use-settings.ts    # Settings management
│   └── use-notifications.ts # Notification handling
├── utils/                # Utility functions
│   ├── ai-chat.ts        # AI chat utilities
│   └── shadcn.ts         # UI utilities
└── styles/               # Global styles
```

## 🔧 How It Works

### Dual-Mode Architecture

#### 🤖 AI Chat Mode
1. **Enable AI Mode**: Toggle AI mode in settings
2. **Direct AI Chat**: Click "Chat with AI" for immediate conversation
3. **Gemini Integration**: Messages are processed through Gemini API
4. **Context Awareness**: AI maintains conversation context
5. **Instant Responses**: Real-time AI response generation

#### 👥 Stranger Chat Mode
1. **Check Existing Rooms**: Look for rooms where user is already waiting
2. **Find Available Rooms**: Search for rooms with status 'waiting'
3. **Join Room**: If available room found, join it and make it 'active'
4. **Create New Room**: If no rooms available, create new 'waiting' room

### Real-time Communication
- Uses Firebase Firestore real-time listeners for stranger chat
- Direct API communication for AI chat
- Messages are synchronized instantly across clients
- Room status updates are propagated in real-time

### Session Management
- Each client gets a unique persistent ID
- IDs are stored in browser storage for session continuity
- AI conversations are stored per client session
- No user authentication required - completely anonymous

### Settings System
- **AI Mode Toggle**: Enable/disable AI chat functionality
- **Allow Markdown**: Support for markdown formatting
- **Allow Emoji**: Enable emoji support in messages
- **Link Preview**: Show previews for shared links
- **Persistent Settings**: Settings saved across sessions

## 🎨 Design Philosophy

The application follows a minimalist design approach:
- **Monochrome Palette**: Pure black, white, and gray tones
- **Clean Typography**: Readable fonts with proper spacing
- **Contextual UI**: Smart interfaces that adapt to chat mode
- **Minimal Color**: Limited color usage except for system states
- **Sharp Design**: Modern, crisp interface elements
- **Vercel-inspired**: Clean, professional aesthetic
- **Intuitive Icons**: Clear visual indicators for different modes

## 🔒 Security & Privacy

- **Anonymous by Design**: No user registration or authentication
- **No Data Persistence**: Messages are deleted when rooms close
- **AI Privacy**: AI conversations are ephemeral and not stored permanently
- **Firebase Security**: Uses Firestore security rules
- **API Security**: Gemini API calls are server-side only
- **Client-side Only**: No server-side user data storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Firebase account
- Gemini API account

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database:
   - Go to "Firestore Database" in the sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location

4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click "Add app" and choose "Web"
   - Register your app and copy the config

### Environment Configuration

Create a `.env.local` file in the root directory with your configurations:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
GEMINI_API_KEY=your-api-key
```

### Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage

### AI Chat Mode
1. Go to Settings (gear icon)
2. Enable "AI Mode"
3. Click "Chat with AI" on the home page
4. Start chatting with the AI assistant
5. Click "Leave" to exit AI chat and disable AI mode

### Stranger Chat Mode
1. Ensure AI mode is disabled in settings
2. Click "Find Stranger" on the home page
3. If someone is waiting, you'll join their room instantly
4. Otherwise, wait for someone to find you
5. Start chatting anonymously
6. Click "Leave Chat" to end the conversation

### Settings
- **AI Mode**: Toggle between AI and stranger chat
- **Markdown Support**: Enable markdown formatting in messages
- **Emoji Support**: Allow emoji usage
- **Link Preview**: Show previews for shared URLs
- **Theme**: Switch between light and dark modes

## 📦 Key Dependencies

- **Firebase**: Real-time database and backend services
- **Gemini**: AI-powered chat responses
- **Next.js**: React framework with server-side rendering
- **Tailwind CSS**: Utility-first styling
- **Zustand**: State management
- **Radix UI**: Accessible component library
- **Sonner**: Toast notifications

## 🛠️ Development Scripts

```bash
pnpm dev        # Start development server with Turbopack
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
pnpm format     # Format code
```

## 🆕 What's New in v0.4.0

### Major Features
- **🤖 AI Chat Integration**: Full Gemini-powered chat experience
- **⚙️ Enhanced Settings**: New AI mode toggle and improved settings UI
- **🔄 Dual-Mode Architecture**: Seamlessly switch between AI and stranger chat
- **💬 Smart Message Handling**: Intelligent message routing based on chat type
- **🎨 Contextual UI**: Dynamic interface that adapts to current mode

### Technical Improvements
- **Enhanced State Management**: Better message storage and session handling
- **Improved Type Safety**: Enhanced TypeScript definitions for AI features
- **Better Error Handling**: Graceful error management for AI responses
- **Performance Optimizations**: Efficient AI response handling and caching

## 🚨 Security Notes

- This app uses Firestore in test mode for development
- For production, set up proper Firestore security rules
- Gemini API keys are kept server-side only
- Consider implementing rate limiting for AI requests
- No user authentication is used - users are anonymous
- AI conversations are not permanently stored

## 🐛 Troubleshooting

If you encounter issues:

### Firebase Issues
1. Verify your Firebase configuration in `.env.local`
2. Check that Firestore is enabled in your Firebase project
3. Ensure you're using the correct project ID

### AI Chat Issues
1. Verify your Gemini API key is correctly set
2. Check that you have sufficient Gemini API credits
3. Ensure AI mode is enabled in settings
4. Check the browser console for API errors

### General Issues
1. Clear browser cache and local storage
2. Check the browser console for error messages
3. Verify all environment variables are set correctly

## 🔮 Future Features

- **Multiple AI Models**: Support for different AI providers
- **Chat History**: Optional conversation history
- **File Sharing**: Image and file sharing capabilities
- **Voice Messages**: Audio message support
- **Group Chats**: Multi-user chat rooms
- **Content Moderation**: Advanced filtering and safety features

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2025 Nguyen Mau Minh

---

This project demonstrates modern web development practices with a focus on dual-mode communication (AI and human), clean design, and anonymous user experience. It showcases the integration of real-time chat with AI capabilities while maintaining a scalable and maintainable architecture.
