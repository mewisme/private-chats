'use client'

import { useCallback, useEffect, useState } from 'react'

import { Logger } from '@/utils/logger'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      Logger.warn('This browser does not support notifications')
      return 'denied'
    }

    if (permission === 'granted') {
      return 'granted'
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [permission])

  const showNotification = useCallback(
    async (options: NotificationOptions): Promise<void> => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        Logger.warn('This browser does not support notifications')
        return
      }

      if (!document.hidden) {
        return
      }

      const currentPermission = permission === 'default' ? await requestPermission() : permission

      if (currentPermission === 'granted') {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'chat-message',
          requireInteraction: false,
          silent: false
        })

        setTimeout(() => {
          notification.close()
        }, 5000)

        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      }
    },
    [permission, requestPermission]
  )

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: typeof window !== 'undefined' && 'Notification' in window
  }
}
