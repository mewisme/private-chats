'use client'

import { cn } from '@/utils'

interface TypingIndicatorProps {
  isAI?: boolean
  className?: string
}

export function TypingIndicator({ isAI = false, className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center space-x-2 p-3', className)}>
      <div className="flex space-x-1">
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
        </div>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {isAI ? 'AI is thinking...' : 'Typing...'}
      </span>
    </div>
  )
}
