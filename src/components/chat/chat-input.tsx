'use client'

import { RefObject, useCallback, useEffect, useRef } from 'react'
import { clearRoomTypingStatus, updateRoomTypingStatus } from '@/lib/typing'

import { Button } from '../ui/button'
import { ChatEmoji } from './chat-emoji'
import { Send } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { useCacheStore } from '@/hooks/use-cache-store'
import { useSettings } from '@/hooks/use-settings'

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
  const { settings } = useSettings()
  const { clientId } = useCacheStore()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isTypingRef = useRef(false)

  // Debounced typing indicator for stranger chat
  const handleTypingStart = useCallback(async () => {
    if (isAI || !roomId || !clientId || !isConnected) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      await updateRoomTypingStatus(roomId, clientId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to clear typing status
    typingTimeoutRef.current = setTimeout(async () => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        await clearRoomTypingStatus(roomId, clientId)
      }
    }, 2000) // Clear typing status after 2 seconds of no activity
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

      // Trigger typing indicator for stranger chat
      if (value.trim() && !isAI) {
        handleTypingStart()
      } else if (!value.trim()) {
        handleTypingStop()
      }
    },
    [setNewMessage, isAI, handleTypingStart, handleTypingStop]
  )

  const enhancedHandleSendMessage = useCallback(() => {
    // Clear typing status when sending message
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

  // Cleanup typing status on unmount or when leaving
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

  useEffect(() => {
    console.log('allowEmoji changed:', settings.allowEmoji)
  }, [settings.allowEmoji])

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
        {settings.allowEmoji && (
          <ChatEmoji setEmoji={(emoji) => setNewMessage(newMessage + emoji)} />
        )}
        <Button
          onClick={enhancedHandleSendMessage}
          disabled={!newMessage.trim() || !isConnected || isSending}
          size={'icon'}
          variant={'ghost'}
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
