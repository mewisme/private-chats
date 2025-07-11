'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Message, listenToMessages, sendMessage } from '@/lib/message'
import { Room, leaveRoom, listenToRoom } from '@/lib/room'
import { clearRoomTypingStatus, listenToTypingStatus } from '@/lib/typing'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { ChatInput } from './chat-input'
import { ChatLeaveButton } from './chat-leave'
import { ChatMessageList } from './chat-message-list'
import { cn } from '@/utils'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useHydratedSettings } from '@/hooks/use-settings'
import { useNotifications } from '@/hooks/use-notifications'

interface ChatRoomProps {
  roomId: string
}

interface AIMessage {
  id: string
  senderId: string
  text: string
  timestamp: number
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [_, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [hasMessages, setHasMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previousMessagesRef = useRef<Message[]>([])
  const originalTitleRef = useRef<string>('')
  const router = useRouter()
  const pathname = usePathname()
  const { clientId, roomId: cacheRoomId, setSubRoom, setSubMessage, clearCache, initializeClientId } = useCacheStore()
  const { showNotification, requestPermission } = useNotifications()
  const { updateSetting } = useHydratedSettings()

  const isAI = pathname.startsWith('/chat/ai')

  // Initialize client ID on mount
  useEffect(() => {
    try {
      initializeClientId()
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize client ID:', error)
      setError('Failed to initialize chat session')
    }
  }, [initializeClientId])

  // Main chat setup effect
  useEffect(() => {
    if (!isInitialized || !clientId) return

    try {
      if (isAI) {
        setIsConnected(true)
        setAiMessages([
          {
            id: 'welcome',
            senderId: 'ai',
            text: "Hello! I'm your AI assistant. How can I help you today?",
            timestamp: Date.now()
          }
        ])
        return
      }

      const unsubRoom = listenToRoom(roomId, (roomData) => {
        try {
          if (!roomData) {
            console.log('ChatRoom - Room deleted, clearing cache')
            if (cacheRoomId === roomId) {
              toast.info('The chat has ended')
              clearCache()
              router.push('/')
            }
            return
          }
          console.log('ChatRoom - Room data:', roomData)
          setRoom(roomData)
          setIsConnected(roomData.status === 'active' && roomData.participants.length === 2)
        } catch (error) {
          console.error('Error handling room data:', error)
        }
      })

      const handleMessagesUpdate = (newMessages: Message[]) => {
        try {
          const previousMessages = previousMessagesRef.current

          if (newMessages.length > previousMessages.length) {
            const latestMessage = newMessages[newMessages.length - 1]

            if (latestMessage && latestMessage.senderId !== clientId) {
              showNotification({
                title: '💬 New message',
                body: latestMessage.text || 'You have a new message'
              }).catch(console.error)

              if (document.hidden) {
                setUnreadCount((prev) => prev + 1)
              }
            }
          }

          previousMessagesRef.current = newMessages
          setMessages(newMessages)
        } catch (error) {
          console.error('Error handling messages update:', error)
        }
      }

      const unsubMessages = listenToMessages(roomId, handleMessagesUpdate)

      const unsubTyping = listenToTypingStatus(roomId, clientId, (isTyping) => {
        try {
          setIsOtherUserTyping(isTyping)
        } catch (error) {
          console.error('Error handling typing status:', error)
        }
      })

      setSubRoom(unsubRoom)
      setSubMessage(unsubMessages)

      return () => {
        try {
          unsubRoom?.()
          unsubMessages?.()
          unsubTyping?.()
          if (clientId) {
            clearRoomTypingStatus(roomId, clientId).catch(console.error)
          }
        } catch (error) {
          console.error('Error during cleanup:', error)
        }
      }
    } catch (error) {
      console.error('Error setting up chat:', error)
      setError('Failed to connect to chat')
    }
  }, [roomId, router, isAI, clientId, showNotification, isInitialized])

  // Mobile-safe auto focus
  useEffect(() => {
    if (isConnected && typeof window !== 'undefined') {
      // Delay focus for mobile compatibility
      const timer = setTimeout(() => {
        try {
          // Only focus if user hasn't manually focused elsewhere
          if (document.activeElement === document.body) {
            inputRef.current?.focus()
          }
        } catch (error) {
          console.warn('Auto-focus failed (mobile restriction):', error)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isConnected])

  useEffect(() => {
    try {
      requestPermission().catch(console.error)
    } catch (error) {
      console.warn('Notification permission request failed:', error)
    }
  }, [requestPermission])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      originalTitleRef.current = document.title

      const handleFocus = () => {
        setUnreadCount(0)
        document.title = originalTitleRef.current
      }

      const handleBlur = () => { }

      window.addEventListener('focus', handleFocus)
      window.addEventListener('blur', handleBlur)

      return () => {
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('blur', handleBlur)
        document.title = originalTitleRef.current
      }
    } catch (error) {
      console.error('Error setting up window event listeners:', error)
    }
  }, [])

  useEffect(() => {
    try {
      if (unreadCount > 0 && document.hidden) {
        document.title = `(${unreadCount}) ${originalTitleRef.current}`
      } else if (unreadCount === 0) {
        document.title = originalTitleRef.current
      }
    } catch (error) {
      console.error('Error updating document title:', error)
    }
  }, [unreadCount])

  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      if (isAI) {
        setHasMessages(aiMessages.length > 0)
      } else {
        setHasMessages(messages.length > 0)
      }
    } catch (error) {
      console.error('Error scrolling to messages end:', error)
    }
  }, [messages, aiMessages, isAI])

  useEffect(() => {
    if (!isAI && typeof window !== 'undefined') {
      const handleUnload = () => {
        try {
          if (!clientId) return
          console.log('BeforeUnload - leaving room:', roomId, 'with clientId:', clientId)
          leaveRoom(roomId, clientId).catch(console.error)
          clearRoomTypingStatus(roomId, clientId).catch(console.error)
        } catch (error) {
          console.error('Error during beforeunload:', error)
        }
      }

      window.addEventListener('beforeunload', handleUnload)

      return () => {
        window.removeEventListener('beforeunload', handleUnload)
      }
    }
  }, [roomId, clientId, isAI])

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
    } catch (error) {
      console.error('Error sending AI message:', error)
      toast.error('Failed to get AI response. Please try again.')
    } finally {
      setIsAIThinking(false)
    }
  }

  const handleSendMessage = async () => {
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

        let content = newMessage
        setNewMessage('')
        await sendAIMessage(content)
      } else {
        let content = newMessage
        setNewMessage('')
        await sendMessage(roomId, clientId, content)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)

      // Mobile-safe focus restore
      setTimeout(() => {
        try {
          inputRef.current?.focus()
        } catch (error) {
          console.warn('Focus restore failed (mobile restriction):', error)
        }
      }, 50)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="mt-10 flex min-h-screen items-center justify-center p-4 lg:mt-0">
        <div className="flex h-[600px] w-full max-w-2xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Initializing chat...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-10 flex min-h-screen items-center justify-center p-4 lg:mt-0">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-lg font-semibold text-red-600">Connection Error</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-10 flex min-h-screen items-center justify-center p-4 lg:mt-0">
      <Card className="flex h-[600px] w-full max-w-2xl flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-white">
              {isAI ? 'AI Assistant' : 'Anonymous Chat'}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isAI
                ? 'Chat with AI assistant'
                : isConnected
                  ? 'Connected with stranger'
                  : 'Waiting for connection...'}
            </p>
          </div>
          <ChatLeaveButton onLeave={() => setAiMessages([])} />
        </CardHeader>

        <CardContent className={cn('flex-1 space-y-3 pb-0', hasMessages && 'overflow-y-auto')}>
          {displayMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
              <p className="text-center text-sm">
                {isConnected ? 'Start your conversation...' : 'Waiting for someone to join...'}
              </p>
            </div>
          ) : (
            <ChatMessageList
              messages={displayMessages}
              isTyping={!isAI && isOtherUserTyping}
              isAIThinking={isAI && isAIThinking}
            />
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
            roomId={roomId}
            isAI={isAI}
          />
        </CardContent>
      </Card>
    </div>
  )
}
