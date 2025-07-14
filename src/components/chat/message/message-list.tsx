'use client'

import { useEffect, useRef } from 'react'

import { Message } from '@/lib/message'
import { MessageItem } from './message-item'
import { TypingIndicator } from '../typing-indicator'
import { cn } from '@/utils'
import { useCacheStore } from '@/hooks/use-cache-store'

interface MessageListProps {
  messages: Message[]
  isTyping?: boolean
  isAIThinking?: boolean
}

export function MessageList({
  messages,
  isTyping = false,
  isAIThinking = false
}: MessageListProps) {
  const { clientId } = useCacheStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, isAIThinking])

  return (
    <div className="space-y-2">
      {messages.map((message, index) => {
        const prev = messages[index - 1]
        const prevTime = prev?.timestamp?.toDate?.()?.getTime?.() ?? 0
        const currentTime = message.timestamp?.toDate?.()?.getTime?.() ?? 0
        const isClose = message.senderId === prev?.senderId && currentTime - prevTime < 1e5

        return (
          <div key={message.id} className={cn(isClose ? 'mt-0.5' : 'mt-2')}>
            <MessageItem message={message} isOwn={message.senderId === clientId} />
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

      {/* Invisible element at the bottom to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  )
}
