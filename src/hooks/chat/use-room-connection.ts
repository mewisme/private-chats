'use client'

import { Room, leaveRoom, listenToRoom } from '@/lib/room'
import { isManuallyNavigating, useRouteSync } from '@/hooks/use-multi-tab-sync'
import { useCallback, useEffect, useState } from 'react'

import { Logger } from '@/utils/logger'
import { clearRoomTypingStatus } from '@/lib/typing'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'
import { usePathname } from 'next/navigation'

export function useRoomConnection(roomId: string) {
  const pathname = usePathname()
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { navigateAndSync } = useRouteSync()

  const {
    clientId,
    roomId: cacheRoomId,
    clearCache,
    initializeClientId,
    isCacheCleared,
    updateIsCacheCleared
  } = useCacheStore()

  const isAI = pathname.startsWith('/chat/ai')

  const handleRoomData = useCallback(
    (roomData: Room | null) => {
      try {
        if (!roomData) {
          if (isManuallyNavigating()) {
            Logger.info('Manual navigation in progress, skipping automatic navigation')
            return
          }

          if (cacheRoomId === roomId && !isCacheCleared) {
            toast.info('The chat has ended')
            updateIsCacheCleared()

            setTimeout(() => {
              if (!isManuallyNavigating()) {
                navigateAndSync('/')
                clearCache()
              }
            }, 100)
          }
          return
        }
        Logger.info('Room data:', roomData)
        setRoom(roomData)
        setIsConnected(roomData.status === 'active' && roomData.participants.length === 2)
      } catch (error) {
        Logger.error('Error handling room data:', error)
      }
    },
    [roomId, cacheRoomId, isCacheCleared, updateIsCacheCleared, navigateAndSync, clearCache]
  )

  useEffect(() => {
    try {
      if (!clientId) {
        initializeClientId()
      }
      setIsInitialized(true)
    } catch (error) {
      Logger.error('Failed to initialize client ID:', error)
      setError('Failed to initialize chat session')
    }
  }, [initializeClientId, clientId])

  useEffect(() => {
    if (!isInitialized || !clientId || isAI) return

    Logger.info('Setting up room listener for:', roomId)

    try {
      const unsubRoom = listenToRoom(roomId, handleRoomData)

      return () => {
        try {
          Logger.info('Cleaning up room listener for:', roomId)
          unsubRoom?.()
          if (clientId) {
            clearRoomTypingStatus(roomId, clientId).catch(Logger.error)
          }
        } catch (error) {
          Logger.error('Error during cleanup:', error)
        }
      }
    } catch (error) {
      Logger.error('Error setting up room connection:', error)
      setError('Failed to connect to chat')
    }
  }, [roomId, clientId, isInitialized, isAI, handleRoomData])

  useEffect(() => {
    if (isAI) {
      setIsConnected(true)
    }
  }, [isAI])

  useEffect(() => {
    if (isAI || typeof window === 'undefined') return

    const handleUnload = () => {
      try {
        if (!clientId) return
        Logger.log('BeforeUnload - leaving room:', roomId, 'with clientId:', clientId)
        leaveRoom(roomId, clientId).catch(Logger.error)
        clearRoomTypingStatus(roomId, clientId).catch(Logger.error)
      } catch (error) {
        Logger.error('Error during beforeunload:', error)
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [roomId, clientId, isAI])

  return {
    room,
    isConnected,
    isInitialized,
    error,
    isAI,
    clientId
  }
}
