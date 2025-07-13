'use client'

import { ChatMessage } from './chat-message'
import { Message } from '@/lib/message'
import { TypingIndicator } from './typing-indicator'
import { cn } from '@/utils'
import { useCacheStore } from '@/hooks/use-cache-store'

interface ChatMessageListProps {
  messages: Message[]
  isTyping?: boolean
  isAIThinking?: boolean
}

export function ChatMessageList({
  messages,
  isTyping = false,
  isAIThinking = false
}: ChatMessageListProps) {
  const { clientId } = useCacheStore()

  return (
    <div>
      {messages.map((message, index) => {
        const prev = messages[index - 1]
        const prevTime = prev?.timestamp?.toDate?.()?.getTime?.() ?? 0
        const currentTime = message.timestamp?.toDate?.()?.getTime?.() ?? 0
        const isClose = message.senderId === prev?.senderId && currentTime - prevTime < 1e5

        return (
          <div key={message.id} className={cn(isClose ? 'mt-0.5' : 'mt-2')}>
            <ChatMessage message={message} isOwn={message.senderId === clientId} />
          </div>
        )
      })}

      {isTyping && (
        <div className="mt-2">
          <TypingIndicator isAI={false} />
        </div>
      )}

      {isAIThinking && (
        <div className="mt-2">
          <TypingIndicator isAI={true} />
        </div>
      )}
    </div>
  )
}
