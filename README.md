# Anonymous Chat App Setup Instructions

This is a real-time anonymous 1-on-1 chat application built with Next.js 15, TypeScript, and Firebase Firestore. Features a clean, monochrome design inspired by Vercel's aesthetic.

## Prerequisites

- Node.js 18+ and pnpm
- Firebase account

## Firebase Setup

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

## Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click "Find Stranger" on the home page
2. If someone is waiting, you'll join their room instantly
3. Otherwise, wait for someone to find you
4. Start chatting anonymously
5. Click "Leave Chat" to end the conversation

## Features

- Real-time messaging using Firebase Firestore
- Anonymous users with persistent client IDs
- Automatic room matching and cleanup
- Monochrome design inspired by Vercel's aesthetic
- Dark mode support with theme toggle
- Responsive design optimized for all devices
- Auto-focus input for seamless typing experience

## Design Philosophy

The app follows a clean, monochrome design language:
- **Pure black and white** for primary elements
- **Gray tones** for secondary elements and borders
- **Minimal color usage** except for error states
- **Clean typography** with proper spacing
- **Sharp, modern** design language similar to Vercel


## Security Notes

- This app uses Firestore in test mode for development
- For production, set up proper Firestore security rules
- Consider implementing rate limiting and content moderation
- No user authentication is used - users are anonymous

## Troubleshooting

If you encounter issues:

1. Verify your Firebase configuration in `.env.local`
2. Check that Firestore is enabled in your Firebase project
3. Ensure you're using the correct project ID
4. Check the browser console for any error messages
