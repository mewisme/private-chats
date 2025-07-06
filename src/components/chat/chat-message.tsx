'use client'

import { appendUTMParams, cn } from '@/utils'

import { Message } from '@/lib/message'
import { SimpleTooltip } from '@/components/common/simple-tooltip'

interface ChatMessageProps {
  message: Message
  isOwn: boolean
}

const urlRegex = /https?:\/\/[^\s]+/g
const utmParams = {
  utm_source: 'chat.mewis.me',
  utm_medium: 'message',
  utm_campaign: 'private-chat'
}


export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const parts = message.text.split(urlRegex)
  const urls = message.text.match(urlRegex)

  const renderMessage = () => {
    const elements: React.ReactNode[] = []

    parts.forEach((part, i) => {
      elements.push(<span key={`text-${i}`}>{part}</span>)
      if (urls && urls[i]) {
        elements.push(
          <a key={`url-${i}`} href={appendUTMParams(urls[i], utmParams)} target="_blank" rel="noopener noreferrer" className='underline'>
            {urls[i]}
          </a>
        )
      }
    })

    return elements
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
              : 'border border-gray-200 bg-gray-100 text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white'
          )}
        >
          <p>{renderMessage()}</p>
        </div>
      </SimpleTooltip>
    </div>
  )
}
