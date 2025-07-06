import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  resetSettings: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value }
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS })
    }),
    {
      name: 'app_settings', // 👈 localStorage key
      partialize: (state) => ({ settings: state.settings }) // optional
    }
  )
)
