'use client'

import dynamic from 'next/dynamic'

import { Loading } from '@/components/common/loading'

const ChatRoom = dynamic(() => import('@/components/chat/chat-room'), {
  ssr: false,
  loading: () => <Loading />
})

export default function AIChatPage() {
  return <ChatRoom roomId="ai" />
}
