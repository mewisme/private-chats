'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Message, listenToMessages, sendMessage } from '@/lib/message'
import { Room, leaveRoom, listenToRoom } from '@/lib/room'
import { useEffect, useRef, useState } from 'react'

import { ChatInput } from './chat-input'
import { ChatMessageList } from './chat-message-list'
import { cn } from '@/utils'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useNotifications } from '@/hooks/use-notifications'
import { useRouter } from 'next/navigation'

interface ChatRoomProps {
  roomId: string
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [_, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [hasMessages, setHasMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previousMessagesRef = useRef<Message[]>([])
  const originalTitleRef = useRef<string>('')
  const router = useRouter()
  const { clientId, setSubRoom, setSubMessage, clearCache } = useCacheStore()
  const { showNotification, requestPermission } = useNotifications()

  useEffect(() => {
    const unsubRoom = listenToRoom(roomId, (roomData) => {
      if (!roomData) {
        console.log('ChatRoom - Room deleted, clearing cache')
        toast.info('The chat has ended')
        clearCache()
        router.push('/')
        return
      }
      console.log('ChatRoom - Room data:', roomData)
      setRoom(roomData)
      setIsConnected(roomData.status === 'active' && roomData.participants.length === 2)
    })

    const handleMessagesUpdate = (newMessages: Message[]) => {
      const previousMessages = previousMessagesRef.current

      if (newMessages.length > previousMessages.length) {
        const latestMessage = newMessages[newMessages.length - 1]

        if (latestMessage && latestMessage.senderId !== clientId) {
          showNotification({
            title: '💬 New message',
            body: latestMessage.text || 'You have a new message'
          })

          if (document.hidden) {
            setUnreadCount((prev) => prev + 1)
          }
        }
      }

      previousMessagesRef.current = newMessages

      setMessages(newMessages)
    }

    const unsubMessages = listenToMessages(roomId, handleMessagesUpdate)

    setSubRoom(unsubRoom)
    setSubMessage(unsubMessages)

    return () => {
      unsubRoom?.()
      unsubMessages?.()
    }
  }, [roomId, router, clearCache, clientId, showNotification])

  useEffect(() => {
    inputRef.current?.focus()
  }, [isConnected])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  useEffect(() => {
    originalTitleRef.current = document.title

    const handleFocus = () => {
      setUnreadCount(0)
      document.title = originalTitleRef.current
    }

    const handleBlur = () => {
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      document.title = originalTitleRef.current
    }
  }, [])

  useEffect(() => {
    if (unreadCount > 0 && document.hidden) {
      document.title = `(${unreadCount}) ${originalTitleRef.current}`
    } else if (unreadCount === 0) {
      document.title = originalTitleRef.current
    }
  }, [unreadCount])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setHasMessages(messages.length > 0)
  }, [messages])

  useEffect(() => {
    const handleUnload = () => {
      if (!clientId) {
        return
      }
      console.log('BeforeUnload - leaving room:', roomId, 'with clientId:', clientId)
      leaveRoom(roomId, clientId)
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [roomId, clientId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      if (!clientId) {
        toast.error('Failed to send message. Please refresh the page and try again.')
        throw new Error('Client ID is not set')
      }

      await sendMessage(roomId, clientId, newMessage)
      setNewMessage('')
    } catch {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)

      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="mt-10 flex min-h-screen items-center justify-center p-4 lg:mt-0">
      <Card className="flex h-[600px] w-full max-w-2xl flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-white">Anonymous Chat</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected with stranger' : 'Waiting for connection...'}
            </p>
          </div>
        </CardHeader>

        <CardContent className={cn('flex-1 space-y-3 pb-0', hasMessages && 'overflow-y-auto')}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
              <p className="text-center text-sm">
                {isConnected ? 'Start your conversation...' : 'Waiting for someone to join...'}
              </p>
            </div>
          ) : (
            <ChatMessageList messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardContent className="pt-4">
          <ChatInput
            inputRef={inputRef}
            isConnected={isConnected}
            isSending={isSending}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSendMessage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
