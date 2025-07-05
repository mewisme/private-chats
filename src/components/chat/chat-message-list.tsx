'use client'

import { getClientId } from '@/lib/client-id'
import { Message } from '@/lib/message'
import { cn } from '@/utils'

import { ChatMessage } from './chat-message'

interface ChatMessageListProps {
  messages: Message[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const clientId = getClientId()

  return (
    <div>
      {messages.map((message, index) => {
        const prev = messages[index - 1]
        const prevTime = prev?.timestamp?.toDate?.()?.getTime?.() ?? 0
        const currentTime = message.timestamp?.toDate?.()?.getTime?.() ?? 0
        const isClose =
          message.senderId === prev?.senderId &&
          currentTime - prevTime < 5000

        return (
          <div key={message.id} className={cn(isClose ? 'mt-0.5' : 'mt-2')}>
            <ChatMessage
              message={message}
              isOwn={message.senderId === clientId}
            />
          </div>
        )
      })}
    </div>
  )
}
