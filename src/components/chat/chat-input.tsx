'use client'

import { RefObject, useEffect } from 'react'

import { Button } from '../ui/button'
import { ChatEmoji } from './chat-emoji'
import { Send } from 'lucide-react'
import { Textarea } from '../ui/textarea'
import { useSettings } from '@/hooks/use-settings'

interface ChatInputProps {
  inputRef: RefObject<HTMLTextAreaElement | null>
  isConnected: boolean
  isSending: boolean
  newMessage: string
  setNewMessage: (value: string) => void
  handleKeyPress: (e: React.KeyboardEvent) => void
  handleSendMessage: () => void
}

export function ChatInput({
  inputRef,
  isConnected,
  isSending,
  newMessage,
  setNewMessage,
  handleKeyPress,
  handleSendMessage
}: ChatInputProps) {
  const { settings } = useSettings()

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
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected || isSending}
          className="flex-1"
        />
        {settings.allowEmoji && (
          <ChatEmoji setEmoji={(emoji) => setNewMessage(newMessage + emoji)} />
        )}
        <Button
          onClick={handleSendMessage}
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
