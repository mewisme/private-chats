import { Logger } from '@/utils/logger'
import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const broadcastCacheChange = (cacheData: Partial<CacheState>) => {
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

type Message = {
  role: 'user' | 'assistant'
  content: string
}

interface CacheState {
  clientId: string
  roomId: string | null

  messages: { clientId: string; messages: Message[] }[]

  isTabLeader: boolean
  tabId: string
  lastSyncTimestamp: number

  isCacheCleared: boolean

  setRoomId: (id: string) => void
  setClientId: (id: string) => void
  clearCache: () => void
  initializeClientId: () => void

  updateIsCacheCleared: () => void

  setMessages: (clientId: string, messages: Message[]) => void

  setTabLeader: (isLeader: boolean) => void
  setTabId: (id: string) => void
  updateSyncTimestamp: () => void
  syncStateAcrossTabs: (state: Partial<CacheState>) => void
  syncCacheFromOtherTab: (cacheData: Partial<CacheState>) => void
}

export const useCacheStore = create<CacheState>((set, get) => ({
  clientId: '',
  roomId: null,
  subRoom: null,
  subMessage: null,

  messages: [],

  isTabLeader: false,
  tabId: typeof window !== 'undefined' ? uuidv4() : '',
  lastSyncTimestamp: 0,

  isCacheCleared: true,

  setClientId: (id) => {
    set({ clientId: id })
    broadcastCacheChange({ clientId: id })
  },

  setRoomId: (id) => {
    set({ roomId: id })
    broadcastCacheChange({ roomId: id })
  },

  initializeClientId: () => {
    const currentClientId = get().clientId
    if (typeof window !== 'undefined' && !currentClientId) {
      const newClientId = uuidv4()
      set({ clientId: newClientId })
      broadcastCacheChange({ clientId: newClientId })
    } else if (!currentClientId) {
      const randomString = Math.random().toString(36).substring(2, 15)
      set({ clientId: randomString })
      broadcastCacheChange({ clientId: randomString })
    }
  },

  clearCache: () => {
    Logger.info('CacheStore - clearCache called')
    const clearedState = {
      clientId: typeof window !== 'undefined' ? uuidv4() : '',
      roomId: null
    }
    set(clearedState)
    broadcastCacheChange(clearedState)
  },

  updateIsCacheCleared: () => {
    const clientId = get().clientId
    const roomId = get().roomId
    if (!clientId && !roomId) {
      set({ isCacheCleared: true })
      broadcastCacheChange({ isCacheCleared: true })
    } else {
      set({ isCacheCleared: false })
      broadcastCacheChange({ isCacheCleared: false })
    }
  },

  setMessages: (clientId, messages) => {
    const newMessages = [...get().messages, { clientId, messages }]
    set({ messages: newMessages })
    broadcastCacheChange({ messages: newMessages })
  },

  setTabLeader: (isLeader) => set({ isTabLeader: isLeader }),
  setTabId: (id) => set({ tabId: id }),
  updateSyncTimestamp: () => set({ lastSyncTimestamp: Date.now() }),
  syncStateAcrossTabs: (state) => {
    const currentState = get()
    const updatedState = {
      ...currentState,
      ...state,
      lastSyncTimestamp: Date.now()
    }
    set(updatedState)
    broadcastCacheChange(updatedState)
  },

  syncCacheFromOtherTab: (cacheData) => {
    try {
      set((state) => ({
        ...state,
        ...cacheData,
        lastSyncTimestamp: Date.now()
      }))
    } catch (error) {
      Logger.error('Failed to sync cache from other tab:', error)
    }
  }
}))

if (typeof window !== 'undefined') {
  window.addEventListener('cache-sync', (event: Event) => {
    const customEvent = event as CustomEvent
    const cacheStore = useCacheStore.getState()
    cacheStore.syncCacheFromOtherTab(customEvent.detail)
  })
}
