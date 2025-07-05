'use client'

import { SimpleTooltip } from '@/components/common/simple-tooltip'
import { Message } from '@/lib/message'
import { cn } from '@/utils'

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const messageContent = (
    <div
      className={cn(
        'max-w-xs lg:max-w-md px-3 py-2 rounded-md text-sm break-words',
        isOwn
          ? 'bg-black dark:bg-white text-white dark:text-black'
          : 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-800'
      )}
    >
      <p>{message.text}</p>
    </div>
  )

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <SimpleTooltip
        message={
          message.timestamp?.toDate?.()?.toLocaleTimeString() ?? 'Sending...'
        }
        side={isOwn ? 'left' : 'right'}
      >
        {messageContent}
      </SimpleTooltip>
    </div>
  )
}
