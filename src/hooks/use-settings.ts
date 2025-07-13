import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'

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
          set((state) => ({
            settings: { ...state.settings, [key]: value }
          }))
        } catch (error) {
          console.error('Failed to update setting:', error)
        }
      },
      resetSettings: () => {
        try {
          set({ settings: DEFAULT_SETTINGS })
        } catch (error) {
          console.error('Failed to reset settings:', error)
        }
      },
      setHydrated: () => set({ isHydrated: true })
    }),
    persistOptions
  )
)

export function useHydratedSettings() {
  const store = useSettings()

  if (typeof window !== 'undefined' && !store.isHydrated) {
    useSettings.persist.rehydrate()
  }

  return store
}
