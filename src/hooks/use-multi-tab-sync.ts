'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Logger } from '@/utils/logger'

export type SyncEvent =
  | { type: 'ROUTE_CHANGE'; route: string; timestamp: number }
  | { type: 'MESSAGE_SENT'; roomId: string; message: any; timestamp: number }
  | { type: 'ROOM_JOINED'; roomId: string; timestamp: number }
  | { type: 'ROOM_LEFT'; roomId: string; timestamp: number }
  | { type: 'STATE_UPDATE'; data: any; timestamp: number }
  | { type: 'SETTINGS_CHANGE'; settings: any; timestamp: number }
  | { type: 'CACHE_CHANGE'; cacheData: any; timestamp: number }

export function useMultiTabSync() {
  const router = useRouter()
  const pathname = usePathname()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const lastEventRef = useRef<number>(0)
  const isInitializedRef = useRef(false)

  const initializeChannel = useCallback(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return

    try {
      if ('BroadcastChannel' in window) {
        channelRef.current = new BroadcastChannel('private-chats-sync')
        Logger.info('Multi-tab sync: Using BroadcastChannel')
      } else {
        Logger.info('Multi-tab sync: Using localStorage fallback')
      }
      isInitializedRef.current = true
    } catch (error) {
      Logger.error('Failed to initialize multi-tab sync:', error)
    }
  }, [])

  const sendEvent = useCallback((event: SyncEvent) => {
    if (typeof window === 'undefined') return

    try {
      const eventWithTimestamp = { ...event, timestamp: Date.now() }

      localStorage.setItem('private-chats-sync-event', JSON.stringify(eventWithTimestamp))
      localStorage.removeItem('private-chats-sync-event')

      if (channelRef.current && 'BroadcastChannel' in window) {
        try {
          channelRef.current.postMessage(eventWithTimestamp)
        } catch (bcError) {
          Logger.warn('BroadcastChannel failed, reinitializing:', bcError)
          try {
            channelRef.current = new BroadcastChannel('private-chats-sync')
            channelRef.current.postMessage(eventWithTimestamp)
          } catch (reinitError) {
            Logger.warn('Failed to reinitialize BroadcastChannel:', reinitError)
          }
        }
      }
    } catch (error) {
      Logger.error('Failed to send multi-tab sync event:', error)
    }
  }, [])

  const handleEvent = useCallback(
    (event: SyncEvent) => {
      if (event.timestamp <= lastEventRef.current) return
      lastEventRef.current = event.timestamp

      switch (event.type) {
        case 'ROUTE_CHANGE':
          if (pathname !== event.route) {
            Logger.info('Multi-tab sync: Navigating to', event.route)
            router.push(event.route)
          }
          break
        case 'MESSAGE_SENT':
          break
        case 'ROOM_JOINED':
          Logger.info('Multi-tab sync: Room joined in another tab:', event.roomId)
          break
        case 'ROOM_LEFT':
          Logger.info('Multi-tab sync: Room left in another tab:', event.roomId)
          break
        case 'STATE_UPDATE':
          Logger.info('Multi-tab sync: State updated in another tab:', event.data)
          break
        case 'SETTINGS_CHANGE':
          Logger.info('Multi-tab sync: Settings changed in another tab:', event.settings)
          window.dispatchEvent(new CustomEvent('settings-sync', { detail: event.settings }))
          break
        case 'CACHE_CHANGE':
          Logger.info('Multi-tab sync: Cache changed in another tab:', event.cacheData)
          window.dispatchEvent(new CustomEvent('cache-sync', { detail: event.cacheData }))
          break
      }
    },
    [pathname, router]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    initializeChannel()

    const handleBroadcastMessage = (event: MessageEvent<SyncEvent>) => {
      handleEvent(event.data)
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'private-chats-sync-event' && event.newValue) {
        try {
          const syncEvent = JSON.parse(event.newValue) as SyncEvent
          handleEvent(syncEvent)
        } catch (error) {
          Logger.error('Failed to parse localStorage sync event:', error)
        }
      }
    }

    if (channelRef.current) {
      channelRef.current.addEventListener('message', handleBroadcastMessage)
    }
    window.addEventListener('storage', handleStorageEvent)

    return () => {
      if (channelRef.current) {
        channelRef.current.removeEventListener('message', handleBroadcastMessage)
      }
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [handleEvent, initializeChannel])

  useEffect(() => {
    if (typeof window === 'undefined' || !isInitializedRef.current) return

    const timer = setTimeout(() => {
      sendEvent({ type: 'ROUTE_CHANGE', route: pathname, timestamp: Date.now() })
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, sendEvent])

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.close()
        } catch (error) {
          Logger.warn('Error closing BroadcastChannel:', error)
        }
      }
    }
  }, [])

  return {
    sendEvent,
    isInitialized: isInitializedRef.current
  }
}

export const broadcastSettingsChange = (settings: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        'private-chats-sync-event',
        JSON.stringify({
          type: 'SETTINGS_CHANGE',
          settings,
          timestamp: Date.now()
        })
      )
      localStorage.removeItem('private-chats-sync-event')
    } catch (error) {
      Logger.error('Failed to broadcast settings change:', error)
    }
  }
}

export const broadcastCacheChange = (cacheData: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        'private-chats-sync-event',
        JSON.stringify({
          type: 'CACHE_CHANGE',
          cacheData,
          timestamp: Date.now()
        })
      )
      localStorage.removeItem('private-chats-sync-event')
    } catch (error) {
      Logger.error('Failed to broadcast cache change:', error)
    }
  }
}

export function useTabSync() {
  const { sendEvent } = useMultiTabSync()

  const syncSettings = useCallback(
    (settings: any) => {
      sendEvent({
        type: 'SETTINGS_CHANGE',
        settings,
        timestamp: Date.now()
      })
    },
    [sendEvent]
  )

  const syncCache = useCallback(
    (cacheData: any) => {
      sendEvent({
        type: 'CACHE_CHANGE',
        cacheData,
        timestamp: Date.now()
      })
    },
    [sendEvent]
  )

  return {
    syncSettings,
    syncCache,
    sendEvent
  }
}

export function useRouteSync() {
  const { sendEvent } = useMultiTabSync()
  const pathname = usePathname()
  const router = useRouter()

  const navigateAndSync = useCallback(
    (route: string) => {
      router.push(route)
      sendEvent({ type: 'ROUTE_CHANGE', route, timestamp: Date.now() })
    },
    [router, sendEvent]
  )

  return { navigateAndSync, currentRoute: pathname }
}
