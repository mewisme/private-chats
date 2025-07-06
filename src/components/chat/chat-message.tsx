'use client'

import { Message } from '@/lib/message'
import { SimpleTooltip } from '@/components/common/simple-tooltip'
import { cn } from '@/utils'

interface ChatMessageProps {
  message: Message
  isOwn: boolean
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const messageContent = (
    <div
      className={cn(
        'max-w-xs rounded-md px-3 py-2 text-sm break-words lg:max-w-md',
        isOwn
          ? 'bg-black text-white dark:bg-gray-100 dark:text-black'
          : 'border border-gray-200 bg-gray-100 text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white'
      )}
    >
      <p>{message.text}</p>
    </div>
  )

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <SimpleTooltip
        message={message.timestamp?.toDate?.()?.toLocaleTimeString() ?? 'Sending...'}
        side={isOwn ? 'left' : 'right'}
      >
        {messageContent}
      </SimpleTooltip>
    </div>
  )
}
