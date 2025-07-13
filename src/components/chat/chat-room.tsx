'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle
} from '../animate-ui/headless/dialog'
import {
  useChat,
  useChatNotifications,
  useInputFocus,
  useRoomConnection,
  useTypingIndicator
} from '@/hooks/chat'

import { Button } from '../ui/button'
import { ChatInput } from './chat-input'
import { ChatLeaveButton } from './chat-leave'
import { ChatMessageList } from './chat-message-list'
import { Loading } from '../common/loading'
import { cn } from '@/utils'
import { useIsClient } from '@/hooks/use-client'

interface ChatRoomProps {
  roomId: string
}

export default function ChatRoom({ roomId }: ChatRoomProps) {
  const isClient = useIsClient()

  const { isConnected, isInitialized, error, isAI, clientId } = useRoomConnection(roomId)

  const {
    messages,
    newMessage,
    setNewMessage,
    isSending,
    hasMessages,
    isAIThinking,
    handleSendMessage,
    handleKeyPress
  } = useChat(roomId)

  const { isOtherUserTyping } = useTypingIndicator(roomId, clientId, isAI)
  const { unreadCount } = useChatNotifications(messages, clientId)
  const { inputRef, messagesEndRef } = useInputFocus(isConnected)

  if (!isClient || !isInitialized) {
    return <Loading />
  }

  const handleCloseErrorDialog = () => window.location.reload()

  if (error) {
    return (
      <Dialog open={true} onClose={handleCloseErrorDialog}>
        <DialogBackdrop />
        <DialogPanel>
          <DialogHeader>
            <DialogTitle>Initialization Error</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseErrorDialog}>Retry</Button>
          </DialogFooter>
        </DialogPanel>
      </Dialog>
    )
  }



  const handleSendMessageWithRef = () => handleSendMessage(inputRef)
  const handleKeyPressWithRef = (e: React.KeyboardEvent) => handleKeyPress(e, inputRef)

  return (
    <div className="mt-10 flex min-h-screen items-center justify-center p-4 lg:mt-0">
      <Card className="flex h-[600px] w-full max-w-2xl flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-white">
              {isAI ? 'AI Assistant' : 'Anonymous Chat'}
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isAI
                ? 'Chat with AI assistant'
                : isConnected
                  ? 'Connected with stranger'
                  : 'Waiting for connection...'}
            </p>
          </div>
          <ChatLeaveButton />
        </CardHeader>

        <CardContent className={cn('flex-1 space-y-3 pb-0', hasMessages && 'overflow-y-auto')}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
              <p className="text-center text-sm">
                {isConnected ? 'Start your conversation...' : 'Waiting for someone to join...'}
              </p>
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
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
            handleKeyPress={handleKeyPressWithRef}
            handleSendMessage={handleSendMessageWithRef}
            roomId={roomId}
            isAI={isAI}
          />
        </CardContent>
      </Card>
    </div>
  )
}
