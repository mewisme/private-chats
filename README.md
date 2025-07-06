# Private Chats - Anonymous Chat Application

## 🚀 Project Overview

**Private Chats** is a real-time anonymous 1-on-1 chat application that connects strangers for private conversations. Built with modern web technologies, it features a clean, monochrome design inspired by Vercel's aesthetic and provides seamless anonymous chatting experience.

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

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **pnpm** - Package manager
- **Turbopack** - Fast development bundler

## 🌟 Key Features

### Core Functionality
- **Anonymous Matching**: Find random strangers to chat with
- **Real-time Messaging**: Instant message delivery using Firestore
- **Room Management**: Automatic room creation and cleanup
- **Persistent Sessions**: Client ID-based session management

### User Experience
- **Clean Monochrome Design**: Black/white/gray color scheme
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Works on all devices
- **Auto-focus Input**: Seamless typing experience
- **Loading States**: Visual feedback during operations

### Technical Features
- **Real-time Updates**: Live message synchronization
- **Automatic Cleanup**: Rooms and messages are cleaned up when users leave
- **Error Handling**: Graceful error management with toast notifications
- **Type Safety**: Full TypeScript implementation

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (Find Stranger)
│   ├── layout.tsx         # Root layout
│   └── chat/[roomId]/     # Dynamic chat room routes
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── chat/             # Chat-specific components
├── lib/                  # Core utilities
│   ├── firebase.ts       # Firebase configuration
│   └── room.ts           # Room management logic
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
└── styles/               # Global styles
```

## 🔧 How It Works

### Room Matching Algorithm
1. **Check Existing Rooms**: Look for rooms where user is already waiting
2. **Find Available Rooms**: Search for rooms with status 'waiting'
3. **Join Room**: If available room found, join it and make it 'active'
4. **Create New Room**: If no rooms available, create new 'waiting' room

### Real-time Communication
- Uses Firebase Firestore real-time listeners
- Messages are synchronized instantly across clients
- Room status updates are propagated in real-time

### Session Management
- Each client gets a unique persistent ID
- IDs are stored in browser storage for session continuity
- No user authentication required - completely anonymous

## 🎨 Design Philosophy

The application follows a minimalist design approach:
- **Monochrome Palette**: Pure black, white, and gray tones
- **Clean Typography**: Readable fonts with proper spacing
- **Minimal Color**: Limited color usage except for system states
- **Sharp Design**: Modern, crisp interface elements
- **Vercel-inspired**: Clean, professional aesthetic

## 🔒 Security & Privacy

- **Anonymous by Design**: No user registration or authentication
- **No Data Persistence**: Messages are deleted when rooms close
- **Firebase Security**: Uses Firestore security rules
- **Client-side Only**: No server-side user data storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Firebase account

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

5. Create a `.env.local` file in the root directory with your Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
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

1. Click "Find Stranger" on the home page
2. If someone is waiting, you'll join their room instantly
3. Otherwise, wait for someone to find you
4. Start chatting anonymously
5. Click "Leave Chat" to end the conversation

## 📦 Key Dependencies

- **Firebase**: Real-time database and backend services
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

## 🚨 Security Notes

- This app uses Firestore in test mode for development
- For production, set up proper Firestore security rules
- Consider implementing rate limiting and content moderation
- No user authentication is used - users are anonymous

## 🐛 Troubleshooting

If you encounter issues:

1. Verify your Firebase configuration in `.env.local`
2. Check that Firestore is enabled in your Firebase project
3. Ensure you're using the correct project ID
4. Check the browser console for any error messages

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2025 Nguyen Mau Minh

---

This project demonstrates modern web development practices with a focus on real-time communication, clean design, and anonymous user experience. It's built to be scalable, maintainable, and provides a solid foundation for anonymous chat applications.
