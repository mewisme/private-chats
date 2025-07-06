'use client'

import dynamic from 'next/dynamic'

// Dynamic import to prevent SSR issues with browser APIs
const ChatRoom = dynamic(() => import('@/components/chat/chat-room'), {
  ssr: false,
  loading: () => (
    <div className="mt-10 flex min-h-screen items-center justify-center p-4 lg:mt-0">
      <div className="flex h-[600px] w-full max-w-2xl items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading AI Chat...</p>
        </div>
      </div>
    </div>
  )
})

export default function AIChatPage() {
  return <ChatRoom roomId="ai" />
}
