'use client'

import { useEffect, useState } from 'react'

import { Logger } from '@/utils/logger'
import { listenToTypingStatus } from '@/lib/typing'

export function useTypingIndicator(roomId: string, clientId: string, isAI: boolean) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)

  useEffect(() => {
    if (isAI || !clientId) return

    try {
      const unsubTyping = listenToTypingStatus(roomId, clientId, (isTyping) => {
        try {
          setIsOtherUserTyping(isTyping)
        } catch (error) {
          Logger.error('Error handling typing status:', error)
        }
      })

      return () => {
        unsubTyping?.()
      }
    } catch (error) {
      Logger.error('Error setting up typing indicator:', error)
    }
  }, [roomId, clientId, isAI])

  return {
    isOtherUserTyping
  }
}
