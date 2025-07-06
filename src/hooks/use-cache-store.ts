import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

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

  setMessages: (clientId: string, messages: Message[]) => void
}

export const useCacheStore = create<CacheState>((set) => ({
  clientId: uuidv4(),
  roomId: null,
  subRoom: null,
  subMessage: null,

  messages: [],

  setClientId: (id) => set({ clientId: id }),
  setRoomId: (id) => set({ roomId: id }),
  setSubRoom: (cb) => set({ subRoom: cb }),
  setSubMessage: (cb) => set({ subMessage: cb }),
  clearCache: () => {
    console.log('CacheStore - clearCache called')
    set({
      clientId: uuidv4(),
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
