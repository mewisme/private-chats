import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'

type Callback = () => void

type Message = {
  role: 'user' | 'assistant'
  content: string
}

interface CacheState {
  clientId: string
  roomId: string | null
  subRoom: Callback | null
  subMessage: Callback | null

  messages: { clientId: string; messages: Message[] }[]

  setRoomId: (id: string) => void
  setClientId: (id: string) => void
  setSubRoom: (cb: Callback) => void
  setSubMessage: (cb: Callback) => void
  clearCache: () => void
  initializeClientId: () => void

  setMessages: (clientId: string, messages: Message[]) => void
}

export const useCacheStore = create<CacheState>((set, get) => ({
  clientId: '', // Initialize empty to prevent hydration mismatch
  roomId: null,
  subRoom: null,
  subMessage: null,

  messages: [],

  setClientId: (id) => set({ clientId: id }),
  setRoomId: (id) => set({ roomId: id }),
  setSubRoom: (cb) => set({ subRoom: cb }),
  setSubMessage: (cb) => set({ subMessage: cb }),

  initializeClientId: () => {
    if (typeof window !== 'undefined' && !get().clientId) {
      set({ clientId: uuidv4() })
    } else {
      const randomString = Math.random().toString(36).substring(2, 15)
      set({ clientId: randomString })
    }
  },

  clearCache: () => {
    console.log('CacheStore - clearCache called')
    set({
      clientId: typeof window !== 'undefined' ? uuidv4() : '',
      roomId: null,
      subRoom: null,
      subMessage: null
    })
  },

  setMessages: (clientId, messages) => {
    set((state) => ({
      messages: [...state.messages, { clientId, messages }]
    }))
  }
}))
