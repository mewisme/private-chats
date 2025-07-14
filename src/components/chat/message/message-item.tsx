'use client'

import { Markdown } from '@/components/common/markdown'
import { Message } from '@/lib/message'
import { SimpleTooltip } from '@/components/common/simple-tooltip'
import { cn } from '@/utils'
import { useSettings } from '@/hooks/use-settings'

interface MessageItemProps {
  message: Message
  isOwn: boolean
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  const { settings } = useSettings()

  const renderMessage = () => {
    if (settings.allowMarkdown) {
      return <Markdown>{message.text}</Markdown>
    }
    return <span>{message.text}</span>
  }

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <SimpleTooltip
        message={message.timestamp?.toDate?.()?.toLocaleTimeString() ?? 'Sending...'}
        side={isOwn ? 'left' : 'right'}
      >
        <div
          className={cn(
            'max-w-xs rounded-md px-3 py-2 text-sm break-words lg:max-w-md',
            isOwn
              ? 'bg-black text-white dark:bg-gray-100 dark:text-black'
              : 'border border-gray-200 bg-gray-200 text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white'
          )}
        >
          {renderMessage()}
        </div>
      </SimpleTooltip>
    </div>
  )
}
