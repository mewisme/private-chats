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

// Singleton channel manager
class ChannelManager {
  private static instance: ChannelManager
  private channel: BroadcastChannel | null = null
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null

  static getInstance(): ChannelManager {
    if (!ChannelManager.instance) {
      ChannelManager.instance = new ChannelManager()
    }
    return ChannelManager.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return
    if (this.initializationPromise) return this.initializationPromise

    this.initializationPromise = this.doInitialize()
    await this.initializationPromise
  }

  private async doInitialize(): Promise<void> {
    if (typeof window === 'undefined') return
    if (this.isInitialized) return

    try {
      if ('BroadcastChannel' in window && !this.channel) {
        this.channel = new BroadcastChannel('private-chats-sync')
        Logger.info('Multi-tab sync: Initialized with BroadcastChannel')
      } else {
        Logger.info('Multi-tab sync: Initialized with localStorage fallback')
      }
      this.isInitialized = true
    } catch (error) {
      Logger.error('Failed to initialize multi-tab sync:', error)
      this.isInitialized = false
    }
  }

  getChannel(): BroadcastChannel | null {
    return this.channel
  }

  isReady(): boolean {
    return this.isInitialized
  }

  close(): void {
    if (this.channel) {
      try {
        this.channel.close()
      } catch (error) {
        Logger.warn('Error closing BroadcastChannel:', error)
      }
      this.channel = null
    }
    this.isInitialized = false
    this.initializationPromise = null
  }
}

export function useMultiTabSync() {
  const router = useRouter()
  const pathname = usePathname()
  const channelManager = ChannelManager.getInstance()
  const lastEventRef = useRef<number>(0)
  const isInitializedRef = useRef(false)
  const navigationThrottleRef = useRef<NodeJS.Timeout | null>(null)

  const initializeChannel = useCallback(async () => {
    if (isInitializedRef.current) return

    try {
      await channelManager.initialize()
      isInitializedRef.current = true
    } catch (error) {
      Logger.error('Failed to initialize channel manager:', error)
    }
  }, [channelManager])

  const sendEvent = useCallback(
    (event: SyncEvent) => {
      if (typeof window === 'undefined') return

      try {
        const eventWithTimestamp = { ...event, timestamp: Date.now() }

        // Always use localStorage fallback for cross-tab communication
        localStorage.setItem('private-chats-sync-event', JSON.stringify(eventWithTimestamp))
        localStorage.removeItem('private-chats-sync-event')

        // Also try BroadcastChannel if available
        const channel = channelManager.getChannel()
        if (channel && 'BroadcastChannel' in window) {
          try {
            channel.postMessage(eventWithTimestamp)
          } catch (bcError: any) {
            if (
              bcError instanceof DOMException &&
              bcError.name === 'InvalidStateError' &&
              bcError.message.includes('Channel is closed')
            ) {
              Logger.warn('BroadcastChannel was closed. Attempting to reinitialize.')
              try {
                channelManager.close()
                channelManager.initialize().then(() => {
                  const newChannel = channelManager.getChannel()
                  if (newChannel) {
                    newChannel.postMessage(eventWithTimestamp)
                  }
                })
              } catch (reinitError) {
                Logger.error('Failed to reinitialize BroadcastChannel:', reinitError)
              }
            } else {
              Logger.warn('BroadcastChannel failed unexpectedly:', bcError)
            }
          }
        }
      } catch (error) {
        Logger.error('Failed to send multi-tab sync event:', error)
      }
    },
    [channelManager]
  )

  const handleEvent = useCallback(
    (event: SyncEvent) => {
      if (event.timestamp <= lastEventRef.current) return
      lastEventRef.current = event.timestamp

      switch (event.type) {
        case 'ROUTE_CHANGE':
          // Only navigate if we're not already on the target route
          if (pathname !== event.route) {
            // Throttle navigation to prevent rapid-fire events
            if (navigationThrottleRef.current) {
              clearTimeout(navigationThrottleRef.current)
            }

            navigationThrottleRef.current = setTimeout(() => {
              // Double-check we're not already on the target route after throttling
              if (pathname !== event.route) {
                Logger.info('Multi-tab sync: Navigating to', event.route, 'from', pathname)
                router.push(event.route)
              }
            }, 100)
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

    let cleanup: (() => void) | undefined

    const setupListeners = async () => {
      await initializeChannel()

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

      const channel = channelManager.getChannel()
      if (channel) {
        channel.addEventListener('message', handleBroadcastMessage)
      }
      window.addEventListener('storage', handleStorageEvent)

      cleanup = () => {
        if (channel) {
          channel.removeEventListener('message', handleBroadcastMessage)
        }
        window.removeEventListener('storage', handleStorageEvent)
      }
    }

    setupListeners()

    return () => {
      cleanup?.()
    }
  }, [handleEvent, initializeChannel, channelManager])

  useEffect(() => {
    if (typeof window === 'undefined' || !isInitializedRef.current) return

    const timer = setTimeout(() => {
      sendEvent({ type: 'ROUTE_CHANGE', route: pathname, timestamp: Date.now() })
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, sendEvent])

  useEffect(() => {
    return () => {
      // Close the channel when the last component unmounts
      if (channelManager.isReady()) {
        channelManager.close()
      }

      // Clear navigation throttle timeout
      if (navigationThrottleRef.current) {
        clearTimeout(navigationThrottleRef.current)
      }
    }
  }, [channelManager])

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

// Global flag to track manual navigation
let isManualNavigating = false

export function useRouteSync() {
  const { sendEvent } = useMultiTabSync()
  const pathname = usePathname()
  const router = useRouter()
  const lastNavigationRef = useRef<{ route: string; timestamp: number } | null>(null)

  const navigateAndSync = useCallback(
    (route: string) => {
      // Prevent duplicate navigation calls within a short time window
      const now = Date.now()
      const lastNav = lastNavigationRef.current

      if (lastNav && lastNav.route === route && now - lastNav.timestamp < 500) {
        Logger.warn('Preventing duplicate navigation to', route)
        return
      }

      // Don't navigate if we're already on the target route
      if (pathname === route) {
        Logger.info('Already on route', route, '- skipping navigation')
        return
      }

      lastNavigationRef.current = { route, timestamp: now }

      // Set global flag to prevent automatic navigation
      isManualNavigating = true

      Logger.info('Navigating to', route, 'from', pathname)
      router.push(route)

      // Send sync event with a small delay to prevent race conditions
      setTimeout(() => {
        sendEvent({ type: 'ROUTE_CHANGE', route, timestamp: now })
        // Clear flag after navigation completes
        setTimeout(() => {
          isManualNavigating = false
        }, 200)
      }, 50)
    },
    [router, sendEvent, pathname]
  )

  return { navigateAndSync, currentRoute: pathname }
}

// Export the flag so other hooks can check it
export const isManuallyNavigating = () => isManualNavigating
