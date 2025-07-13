'use client'

import { useEffect, useRef, useState } from 'react'

import { Logger } from '@/utils/logger'
import { Message } from '@/lib/message'
import { useNotifications } from '@/hooks/use-notifications'

export function useChatNotifications(messages: Message[], clientId: string) {
  const [unreadCount, setUnreadCount] = useState(0)
  const previousMessagesRef = useRef<Message[]>([])
  const originalTitleRef = useRef<string>('')
  const { showNotification, requestPermission } = useNotifications()

  useEffect(() => {
    try {
      requestPermission().catch(Logger.error)
    } catch (error) {
      Logger.warn('Notification permission request failed:', error)
    }
  }, [requestPermission])

  useEffect(() => {
    if (!clientId) return

    const previousMessages = previousMessagesRef.current

    if (messages.length > previousMessages.length) {
      const latestMessage = messages[messages.length - 1]

      if (latestMessage && latestMessage.senderId !== clientId) {
        showNotification({
          title: '💬 New message',
          body: latestMessage.text || 'You have a new message'
        }).catch(Logger.error)

        if (document.hidden) {
          setUnreadCount((prev) => prev + 1)
        }
      }
    }

    previousMessagesRef.current = messages
  }, [messages, clientId, showNotification])

  useEffect(() => {
    if (typeof window === 'undefined') return

    originalTitleRef.current = document.title

    const handleFocus = () => {
      setUnreadCount(0)
      document.title = originalTitleRef.current
    }

    const handleBlur = () => { }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitleRef.current}`
    } else {
      document.title = originalTitleRef.current
    }
  }, [unreadCount])

  return {
    unreadCount,
    setUnreadCount
  }
}
