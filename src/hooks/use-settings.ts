import { PersistOptions, persist } from 'zustand/middleware'

import { Logger } from '@/utils/logger'
import { create } from 'zustand'

export type Settings = {
  allowMarkdown: boolean
  allowEmoji: boolean
  linkPreview: boolean
  aiMode: boolean
}

const DEFAULT_SETTINGS: Settings = {
  allowMarkdown: false,
  allowEmoji: false,
  linkPreview: false,
  aiMode: false
}

type SettingsState = {
  settings: Settings
  isHydrated: boolean
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  resetSettings: () => void
  setHydrated: () => void
  syncSettingsFromOtherTab: (settings: Settings) => void
}

const broadcastSettingsChange = (settings: Settings) => {
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

const persistOptions: PersistOptions<SettingsState, Partial<SettingsState>> = {
  name: 'app_settings',
  partialize: (state) => ({ settings: state.settings, isHydrated: state.isHydrated }),
  skipHydration: true, // Always skip hydration to prevent mismatches
  onRehydrateStorage: () => (state) => {
    if (state) {
      state.setHydrated()
    }
  }
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isHydrated: false,
      updateSetting: (key, value) => {
        try {
          const newSettings = { ...get().settings, [key]: value }
          set((state) => ({
            settings: newSettings
          }))
          broadcastSettingsChange(newSettings)
        } catch (error) {
          Logger.error('Failed to update setting:', error)
        }
      },
      resetSettings: () => {
        try {
          set({ settings: DEFAULT_SETTINGS })
          broadcastSettingsChange(DEFAULT_SETTINGS)
        } catch (error) {
          Logger.error('Failed to reset settings:', error)
        }
      },
      setHydrated: () => set({ isHydrated: true }),

      syncSettingsFromOtherTab: (settings) => {
        try {
          set({ settings })
        } catch (error) {
          Logger.error('Failed to sync settings from other tab:', error)
        }
      }
    }),
    persistOptions
  )
)

if (typeof window !== 'undefined') {
  window.addEventListener('settings-sync', (event: Event) => {
    const customEvent = event as CustomEvent
    const settingsStore = useSettings.getState()
    settingsStore.syncSettingsFromOtherTab(customEvent.detail)
  })
}

export function useHydratedSettings() {
  const store = useSettings()

  if (typeof window !== 'undefined' && !store.isHydrated) {
    useSettings.persist.rehydrate()
  }

  return store
}
