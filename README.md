# Private Chats

A modern real-time anonymous chat application with dual-mode functionality - chat with AI or connect with strangers anonymously. Built with Next.js 15, Firebase, and using the Gemini API for AI responses.

## 🚀 Features

### Multi-Tab Synchronization
- **🔄 Route Sync**: All browser tabs automatically navigate to the same route as the first tab
- **⚡ Real-time Message Sync**: Messages sent in one tab instantly appear in all other tabs
- **⚙️ Settings Sync**: Settings changes in one tab are immediately reflected in all other tabs
- **💾 Cache Sync**: Application state and cache changes are synchronized across all tabs
- **📡 Cross-Tab Communication**: Uses BroadcastChannel API with localStorage fallback for seamless synchronization
- **🛡️ Infinite Loop Protection**: Smart navigation logic prevents redirect loops between tabs

### Dual-Mode Chat System
- **🤖 AI Chat Mode**: Intelligent conversations using Gemini 2.5 Flash API
- **👥 Anonymous Stranger Chat**: Real-time anonymous 1-on-1 conversations
- **⚙️ Settings Toggle**: Easy switching between chat modes

### Core Functionality
- **Real-time Messaging**: Instant message delivery using Firebase Firestore
- **Anonymous Matching**: Automatic pairing with available strangers
- **Room Management**: Automatic room creation, joining, and cleanup
- **Session Persistence**: Client-based session management without authentication
- **Message History**: Temporary message storage during active sessions

### User Experience
- **Clean Monochrome Design**: Minimalist black, white, and gray aesthetic
- **Dark/Light Mode**: System-aware theme switching
- **Responsive Design**: Optimized for all device sizes
- **Auto-focus Input**: Seamless typing experience
- **Loading States**: Visual feedback during operations
- **Toast Notifications**: Real-time status updates

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Real-time Updates**: Live message synchronization
- **Multi-Tab Sync**: Cross-tab communication using BroadcastChannel API
- **Error Boundaries**: Graceful error handling and recovery
- **PWA Support**: Progressive Web App capabilities
- **Automatic Cleanup**: Scheduled removal of inactive rooms and messages

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### Backend & Database
- **[Firebase Firestore](https://firebase.google.com/docs/firestore)** - Real-time NoSQL database
- **[Gemini AI API](https://ai.google.dev/)** - AI chat responses via API
- **[Vercel](https://vercel.com/)** - Deployment and hosting

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[pnpm](https://pnpm.io/)** - Package manager
- **[Turbopack](https://turbo.build/pack)** - Fast development bundler

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (home)/            # Home page group
│   │   └── page.tsx       # Landing page with mode selection
│   ├── chat/              # Chat routes
│   │   ├── [roomId]/      # Dynamic stranger chat rooms
│   │   │   └── page.tsx   # Stranger chat page
│   │   └── ai/            # AI chat route
│   │       └── page.tsx   # AI chat page
│   ├── api/               # API routes
│   │   ├── ai/            # AI chat endpoint
│   │   │   └── route.ts   # Gemini API integration
│   │   └── cleanup/       # Room cleanup endpoint
│   │       └── route.ts   # Scheduled cleanup job
│   ├── layout.tsx         # Root layout with providers
│   └── manifest.ts        # PWA manifest
├── components/            # UI components
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat-specific components
│   │   ├── chat-room.tsx # Main chat interface
│   │   ├── chat-input.tsx # Message input component
│   │   ├── chat-message-list.tsx # Message display
│   │   └── chat-leave.tsx # Leave chat button
│   ├── common/           # Shared components
│   │   ├── app-header.tsx # Application header
│   │   ├── loading.tsx   # Loading states
│   │   └── settings/     # Settings dialog
│   ├── providers/        # Context providers
│   │   ├── theme-provider.tsx # Theme management
│   │   └── error-boundary.tsx # Error handling
│   └── base/            # Base components
│       └── logo.tsx     # Application logo
├── lib/                  # Core utilities
│   ├── firebase.ts      # Firebase configuration
│   ├── room.ts          # Room management logic
│   ├── message.ts       # Message handling
│   └── typing.ts        # Typing indicators
├── hooks/               # Custom React hooks
│   ├── use-cache-store.ts # Client state management
│   ├── use-settings.ts   # Settings management
│   ├── use-client.ts     # Client-side utilities
│   └── use-notifications.ts # Notification system
├── utils/               # Utility functions
│   ├── ai-chat.ts       # AI chat utilities
│   └── index.ts         # Common utilities
└── styles/              # Global styles
    └── globals.css      # Tailwind CSS configuration
```

## 🔄 Multi-Tab Synchronization

Private Chats features advanced multi-tab synchronization that ensures a seamless experience across multiple browser tabs:

### How It Works
- **Route Synchronization**: When you navigate to a new chat room in one tab, all other tabs automatically follow to the same route
- **Message Synchronization**: Messages sent or received in any tab are instantly reflected in all other open tabs
- **Settings Synchronization**: Changes to app settings (AI mode, markdown, etc.) in one tab are immediately applied to all other tabs
- **Cache Synchronization**: Application state including client ID, room ID, and session data is kept consistent across all tabs
- **State Consistency**: Chat state, including typing indicators and connection status, is kept consistent across tabs

### Technical Implementation
- **Primary Method**: Uses the modern `BroadcastChannel` API for efficient cross-tab communication
- **Fallback Support**: Automatically falls back to `localStorage` events for older browsers
- **Loop Prevention**: Smart timestamping and duplicate detection prevents infinite redirect loops
- **Performance Optimized**: Minimal overhead with event-driven architecture

### User Experience Benefits
- **Multi-tasking**: Work in multiple tabs without losing context
- **Instant Updates**: No need to refresh or switch tabs to see new messages
- **Consistent Settings**: Settings changes are immediately reflected across all tabs
- **Seamless State**: Application state remains consistent regardless of which tab you're using
- **Consistent Navigation**: All tabs stay in sync when moving between chat rooms
- **Seamless AI Chat**: AI conversations are synchronized across all tabs in real-time
- **Persistent Sessions**: Client sessions and room connections are maintained across all tabs

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and **pnpm 10+**
- **Firebase Account** - [Firebase Console](https://console.firebase.google.com/)
- **Google AI Studio Account** - [AI Studio](https://makersuite.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/mewisme/private-chats.git
cd private-chats
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Enable Firestore Database in "test mode" for development

2. **Get Firebase Configuration**
   - Go to Project Settings → General → Your apps
   - Click "Add app" and select "Web"
   - Copy the Firebase config object

3. **Set up Firestore Security Rules** (for production)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2024, 12, 31);
       }
     }
   }
   ```

### 4. Gemini AI Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for environment configuration

### 5. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini AI Configuration
SERVER_GEMINI_API_KEY=your_SERVER_GEMINI_API_KEY

# Server Configuration (optional)
SERVER_CRON_SECRET=your_secure_random_string
```

### 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### AI Chat Mode

1. **Enable AI Mode**
   - Click the settings icon (⚙️) in the header
   - Toggle "AI Mode" to ON
   - Close the settings dialog

2. **Start AI Chat**
   - Click "Chat with AI" on the home page
   - Begin typing to start a conversation
   - The AI responds in real-time via Gemini 2.5 Flash API

3. **AI Features**
   - Contextual conversations with memory
   - Markdown support for formatted responses
   - Instant response generation
   - Private conversation history

### Anonymous Stranger Chat

1. **Disable AI Mode**
   - Ensure AI Mode is OFF in settings
   - This enables stranger chat functionality

2. **Find a Chat Partner**
   - Click "Find Stranger" on the home page
   - System will either:
     - Connect you instantly if someone is waiting
     - Put you in a waiting room for others to find

3. **Chat Experience**
   - Completely anonymous - no registration required
   - Real-time message delivery
   - Typing indicators
   - Leave anytime with the "Leave Chat" button

### Settings Configuration

Access settings via the gear icon (⚙️) in the header:

- **AI Mode**: Toggle between AI and stranger chat
- **Allow Markdown**: Enable markdown formatting in messages
- **Link Preview**: Show previews for shared links
- **Theme**: Switch between light, dark, and system themes

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build           # Build for production
pnpm start           # Start production server

# Code Quality
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix ESLint issues
pnpm format          # Format code with Prettier
pnpm format:check    # Check code formatting
```

### API Endpoints

**🔒 Security**: All API endpoints require valid origin headers from allowed domains.

#### `/api/ai` (POST)
AI chat endpoint using Gemini 2.5 Flash API
- **Headers**: `Origin: allowed-domain.com` (required)
- **Request**: `{ clientId: string, content: string }`
- **Response**: `{ role: string, content: string }`

#### `/api/cleanup` (POST)
Scheduled cleanup job for inactive rooms and messages
- **Headers**: `x-cron-secret: SERVER_CRON_SECRET` (bypasses origin validation)
- **Query**: `?dry-run=true` (optional)
- **Response**: Cleanup summary and statistics

#### `/api/cleanup` (GET)
Health check endpoint
- **Headers**: `Origin: allowed-domain.com` (required)
- **Response**: Service status and timestamp

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ | `my-project` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | ✅ | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ | `1:123:web:abc` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | ❌ | `G-XXXXXXXXX` |
| `SERVER_GEMINI_API_KEY` | Gemini AI API key | ✅ | `AIzaSyD...` |
| `SERVER_CRON_SECRET` | Cron job authentication | ❌ | `secure_random_string` |

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import project to [Vercel](https://vercel.com)
   - Connect your GitHub repository

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure Firebase and Gemini API keys are correctly set

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at your Vercel domain

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🔒 Security & Privacy

### Privacy Features
- **No Authentication Required**: Completely anonymous usage
- **No Data Persistence**: Messages deleted when rooms close
- **Client-Side Session Management**: No server-side user tracking
- **Ephemeral AI Conversations**: AI chat history not permanently stored

### Security Measures
- **Firebase Security Rules**: Firestore access controls
- **API Key Protection**: Server-side only API usage
- **Input Validation**: Sanitized user inputs
- **Rate Limiting**: Built-in protection against abuse
- **Origin Validation**: Multi-layered API protection against cross-origin attacks

### API Origin Validation
The application implements comprehensive origin-based security for all API endpoints:

#### Multi-Layer Protection
- **Next.js Middleware**: First-line defense filtering requests before they reach API routes
- **Route-Level Validation**: Additional validation within each API route handler
- **Environment Configuration**: Flexible origin management via environment variables

### Production Considerations
- Update Firebase security rules for production
- Implement rate limiting for API endpoints
- Set up monitoring and error tracking
- Configure proper CORS policies
- Monitor API security logs for blocked requests

## 🐛 Troubleshooting

### Common Issues

#### Firebase Connection Problems
```bash
# Check your Firebase configuration
- Verify all NEXT_PUBLIC_FIREBASE_* variables are set
- Ensure Firestore is enabled in Firebase Console
- Check Firebase project permissions
```

#### AI Chat Not Working
```bash
# Verify Gemini API setup
- Check SERVER_GEMINI_API_KEY is valid
- Ensure sufficient API quota/credits
- Verify AI Mode is enabled in settings
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

#### API Origin Validation Issues
```bash
- Verify the origin header is being sent by your client
- For development, ensure localhost origins are included
- Check browser console for blocked requests

# Cron jobs failing
- Verify SERVER_CRON_SECRET is correctly set
- Ensure cron job sends x-cron-secret header
- Check API logs for authentication errors
```

### Debug Mode
Enable debug logging by adding to your `.env.local`:
```bash
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - React framework
- **[Firebase](https://firebase.google.com/)** - Backend infrastructure
- **[Gemini AI](https://ai.google.dev/)** - AI API service
- **[Vercel](https://vercel.com/)** - Deployment platform
- **[shadcn/ui](https://ui.shadcn.com/)** - UI components

---

Built with ❤️ by [Nguyen Mau Minh](https://mewis.me) • [Live Demo](https://chat.mewis.me) • [GitHub](https://github.com/mewisme)
