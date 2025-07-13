'use client'

import { Room, leaveRoom, listenToRoom } from '@/lib/room'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { Logger } from '@/utils/logger'
import { clearRoomTypingStatus } from '@/lib/typing'
import { toast } from 'sonner'
import { useCacheStore } from '@/hooks/use-cache-store'

export function useRoomConnection(roomId: string) {
  const pathname = usePathname()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    clientId,
    roomId: cacheRoomId,
    setSubRoom,
    clearCache,
    initializeClientId
  } = useCacheStore()

  const isAI = pathname.startsWith('/chat/ai')

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

    try {
      const unsubRoom = listenToRoom(roomId, (roomData) => {
        try {
          if (!roomData) {
            Logger.log('Room deleted, clearing cache')
            if (cacheRoomId === roomId) {
              toast.info('The chat has ended')
              clearCache()
              router.push('/')
            }
            return
          }
          Logger.log('Room data:', roomData)
          setRoom(roomData)
          setIsConnected(roomData.status === 'active' && roomData.participants.length === 2)
        } catch (error) {
          Logger.error('Error handling room data:', error)
        }
      })

      setSubRoom(unsubRoom)

      return () => {
        try {
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
  }, [
    roomId,
    router,
    isAI,
    clientId,
    isInitialized,
    cacheRoomId,
    setSubRoom,
    clearCache,
    initializeClientId
  ])

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
