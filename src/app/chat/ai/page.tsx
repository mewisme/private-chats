'use client'

import { LoadingPage } from '@/components/common/loading-page'
import dynamic from 'next/dynamic'

const ChatRoom = dynamic(() => import('@/components/chat/chat-room'), {
  ssr: false,
  loading: () => <LoadingPage />
})

export default function AIChatPage() {
  return <ChatRoom roomId="ai" />
}
