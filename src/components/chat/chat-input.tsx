'use client'

import { RefObject, useCallback, useEffect, useRef } from 'react'
import { clearRoomTypingStatus, updateRoomTypingStatus } from '@/lib/typing'

import { Button } from '@/components/ui/button'
import { ChatEmoji } from './chat-emoji'
import { Send } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useIsClient } from '@/hooks/use-client'

interface ChatInputProps {
  inputRef: RefObject<HTMLTextAreaElement | null>
  isConnected: boolean
  isSending: boolean
  newMessage: string
  setNewMessage: (value: string) => void
  handleKeyPress: (e: React.KeyboardEvent) => void
  handleSendMessage: () => void
  roomId?: string
  isAI?: boolean
}

export function ChatInput({
  inputRef,
  isConnected,
  isSending,
  newMessage,
  setNewMessage,
  handleKeyPress,
  handleSendMessage,
  roomId,
  isAI = false
}: ChatInputProps) {
  const isClient = useIsClient()
  const { clientId } = useCacheStore()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)

  const handleTypingStart = useCallback(async () => {
    if (isAI || !roomId || !clientId || !isConnected) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      await updateRoomTypingStatus(roomId, clientId)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(async () => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        await clearRoomTypingStatus(roomId, clientId)
      }
    }, 2000)
  }, [isAI, roomId, clientId, isConnected])

  const handleTypingStop = useCallback(async () => {
    if (isAI || !roomId || !clientId) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (isTypingRef.current) {
      isTypingRef.current = false
      await clearRoomTypingStatus(roomId, clientId)
    }
  }, [isAI, roomId, clientId])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setNewMessage(value)

      if (value.trim() && !isAI) {
        handleTypingStart()
      } else if (!value.trim()) {
        handleTypingStop()
      }
    },
    [setNewMessage, isAI, handleTypingStart, handleTypingStop]
  )

  const enhancedHandleSendMessage = useCallback(() => {
    handleTypingStop()
    handleSendMessage()
  }, [handleTypingStop, handleSendMessage])

  const enhancedHandleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        handleTypingStop()
      }
      handleKeyPress(e)
    },
    [handleTypingStop, handleKeyPress]
  )

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTypingRef.current && roomId && clientId && !isAI) {
        clearRoomTypingStatus(roomId, clientId)
      }
    }
  }, [roomId, clientId, isAI])

  if (!isClient) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Textarea
          ref={inputRef}
          placeholder="Type your message..."
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={enhancedHandleKeyPress}
          disabled={!isConnected || isSending}
          className="flex-1"
        />
        <ChatEmoji setEmoji={(emoji) => setNewMessage(newMessage + emoji)} />
        <Button
          onClick={enhancedHandleSendMessage}
          disabled={!newMessage.trim() || !isConnected || isSending}
          size={'icon'}
          variant={'ghost'}
          className="transition-all duration-300"
        >
          <Send />
        </Button>
      </div>
      {!isConnected && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Waiting for someone to join the chat...
        </p>
      )}
    </>
  )
}
