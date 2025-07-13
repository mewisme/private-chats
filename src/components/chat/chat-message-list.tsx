'use client'

import { useCacheStore } from '@/hooks/use-cache-store'
import { Message } from '@/lib/message'
import { cn } from '@/utils'

import { ChatMessage } from './chat-message'
import { TypingIndicator } from './typing-indicator'

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

      {/* Show typing indicator for stranger chat */}
      {isTyping && (
        <div className="mt-2">
          <TypingIndicator isAI={false} />
        </div>
      )}

      {/* Show thinking indicator for AI chat */}
      {isAIThinking && (
        <div className="mt-2">
          <TypingIndicator isAI={true} />
        </div>
      )}
    </div>
  )
}
