'use client'

import { Message, listenToMessages, sendMessage } from '@/lib/message'
import { useEffect, useRef, useState } from 'react'

import { Logger } from '@/utils/logger'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useMultiTabSync } from '@/hooks/use-multi-tab-sync'
import { usePathname } from 'next/navigation'

export interface AIMessage {
  id: string
  senderId: string
  text: string
  timestamp: number
}

export function useChat(roomId: string) {
  const pathname = usePathname()
  const [messages, setMessages] = useState<Message[]>([])
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [hasMessages, setHasMessages] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)

  const previousMessagesRef = useRef<Message[]>([])
  const { clientId } = useCacheStore()
  const { sendEvent } = useMultiTabSync()

  const isAI = pathname.startsWith('/chat/ai')

  useEffect(() => {
    if (isAI || !clientId) return

    const handleMessagesUpdate = (newMessages: Message[]) => {
      try {
        previousMessagesRef.current = newMessages
        setMessages(newMessages)
        setHasMessages(newMessages.length > 0)
      } catch (error) {
        Logger.error('Error handling messages update:', error)
      }
    }

    const unsubMessages = listenToMessages(roomId, handleMessagesUpdate)

    return () => {
      unsubMessages?.()
    }
  }, [roomId, isAI, clientId])

  useEffect(() => {
    if (!isAI) return

    setAiMessages([
      {
        id: 'welcome',
        senderId: 'ai',
        text: "Hello! I'm your AI assistant. How can I help you today?",
        timestamp: Date.now()
      }
    ])
    setHasMessages(true)
  }, [isAI])

  useEffect(() => {
    if (!isAI || typeof window === 'undefined') return

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'private-chats-sync-event' && event.newValue) {
        try {
          const syncEvent = JSON.parse(event.newValue)
          if (syncEvent.type === 'MESSAGE_SENT' && syncEvent.roomId === 'ai') {
            const { message } = syncEvent

            setAiMessages((prev) => {
              const messageExists = prev.some((msg) => msg.id === message.id)
              if (!messageExists) {
                return [...prev, message]
              }
              return prev
            })
          }
        } catch (error) {
          Logger.error('Failed to parse sync event:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageEvent)

    return () => {
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [isAI])

  const sendAIMessage = async (userMessage: string) => {
    setIsAIThinking(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: clientId,
          content: userMessage
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      const aiResponse: AIMessage = {
        id: `ai-${Date.now()}`,
        senderId: 'ai',
        text: data.content,
        timestamp: Date.now()
      }

      setAiMessages((prev) => [...prev, aiResponse])

      sendEvent({
        type: 'MESSAGE_SENT',
        roomId: 'ai',
        message: aiResponse,
        timestamp: Date.now()
      })
    } catch (error) {
      Logger.error('Error sending AI message:', error)
      toast.error('Failed to get AI response. Please try again.')
    } finally {
      setIsAIThinking(false)
    }
  }

  const handleSendMessage = async (inputRef?: React.RefObject<HTMLTextAreaElement | null>) => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      if (!clientId) {
        toast.error('Failed to send message. Please refresh the page and try again.')
        throw new Error('Client ID is not set')
      }

      if (isAI) {
        const userMessage: AIMessage = {
          id: `user-${Date.now()}`,
          senderId: clientId,
          text: newMessage,
          timestamp: Date.now()
        }
        setAiMessages((prev) => [...prev, userMessage])

        sendEvent({
          type: 'MESSAGE_SENT',
          roomId: 'ai',
          message: userMessage,
          timestamp: Date.now()
        })

        let content = newMessage
        setNewMessage('')
        await sendAIMessage(content)
      } else {
        let content = newMessage
        setNewMessage('')
        await sendMessage(roomId, clientId, content)

        sendEvent({
          type: 'MESSAGE_SENT',
          roomId: roomId,
          message: {
            senderId: clientId,
            text: content,
            timestamp: Date.now()
          },
          timestamp: Date.now()
        })
      }
    } catch (error) {
      Logger.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)

      setTimeout(() => {
        try {
          inputRef?.current?.focus()
        } catch (error) {
          Logger.warn('Focus restore failed (mobile restriction):', error)
        }
      }, 50)
    }
  }

  const handleKeyPress = (
    e: React.KeyboardEvent,
    inputRef?: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputRef)
    }
  }

  const displayMessages: Message[] = isAI
    ? aiMessages.map((msg) => ({
        id: msg.id,
        roomId: 'ai',
        senderId: msg.senderId === 'ai' ? 'ai-assistant' : msg.senderId,
        text: msg.text,
        timestamp: {
          toDate: () => new Date(msg.timestamp),
          seconds: Math.floor(msg.timestamp / 1000)
        }
      }))
    : messages

  return {
    messages: displayMessages,
    newMessage,
    setNewMessage,
    isSending,
    hasMessages,
    isAIThinking,
    isAI,
    handleSendMessage,
    handleKeyPress,
    previousMessagesRef
  }
}
