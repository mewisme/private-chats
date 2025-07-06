'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Message, listenToMessages, sendMessage } from '@/lib/message'
import { Room, leaveRoom, listenToRoom } from '@/lib/room'
import { clearRoomTypingStatus, listenToTypingStatus } from '@/lib/typing'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ChatInput } from './chat-input'
import { ChatMessageList } from './chat-message-list'
import { LogOut } from 'lucide-react'
import { cn } from '@/utils'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useNotifications } from '@/hooks/use-notifications'
import { useSettings } from '@/hooks/use-settings'

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

  // Typing indicator states
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previousMessagesRef = useRef<Message[]>([])
  const originalTitleRef = useRef<string>('')
  const router = useRouter()
  const pathname = usePathname()
  const { clientId, roomId: cacheRoomId, setSubRoom, setSubMessage, clearCache } = useCacheStore()
  const { showNotification, requestPermission } = useNotifications()
  const { updateSetting } = useSettings()

  const isAI = pathname.startsWith('/chat/ai')

  useEffect(() => {
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
      if (!roomData) {
        console.log('ChatRoom - Room deleted, clearing cache')
        // Only clear cache and redirect if we haven't already left manually
        // Check if cache roomId matches URL roomId - if not, we've already left
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

    // Listen to typing status for stranger chat
    const unsubTyping = listenToTypingStatus(roomId, clientId, (isTyping) => {
      setIsOtherUserTyping(isTyping)
    })

    setSubRoom(unsubRoom)
    setSubMessage(unsubMessages)

    return () => {
      unsubRoom?.()
      unsubMessages?.()
      unsubTyping?.()
      // Clear typing status when leaving
      if (clientId) {
        clearRoomTypingStatus(roomId, clientId)
      }
    }
  }, [roomId, router, isAI, clientId, showNotification])

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

    const handleBlur = () => {}

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
    if (isAI) {
      setHasMessages(aiMessages.length > 0)
    } else {
      setHasMessages(messages.length > 0)
    }
  }, [messages, aiMessages, isAI])

  useEffect(() => {
    if (!isAI) {
      const handleUnload = () => {
        if (!clientId) {
          return
        }
        console.log('BeforeUnload - leaving room:', roomId, 'with clientId:', clientId)
        leaveRoom(roomId, clientId)
        clearRoomTypingStatus(roomId, clientId)
      }

      window.addEventListener('beforeunload', handleUnload)

      return () => {
        window.removeEventListener('beforeunload', handleUnload)
      }
    }
  }, [roomId, clientId, isAI])

  const sendAIMessage = async (userMessage: string) => {
    setIsAIThinking(true) // Show AI thinking indicator

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
        throw new Error('Failed to get AI response')
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
      toast.error('Failed to get AI response')
    } finally {
      setIsAIThinking(false) // Hide AI thinking indicator
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

  const handleLeaveAI = () => {
    setAiMessages([])
    updateSetting('aiMode', false)
    toast.success('AI mode disabled')
    router.push('/')
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
          {isAI && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveAI}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Leave
            </Button>
          )}
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
