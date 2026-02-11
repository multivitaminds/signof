import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SidebarDensity, FontSize } from '../types'
import type { Theme } from '../../../types'

interface AppearanceState {
  theme: Theme
  accentColor: string
  sidebarDensity: SidebarDensity
  fontSize: FontSize

  setTheme: (theme: Theme) => void
  setAccentColor: (color: string) => void
  setSidebarDensity: (density: SidebarDensity) => void
  setFontSize: (size: FontSize) => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.setAttribute('data-theme', resolved)
}

function applyFontSize(size: FontSize) {
  const sizeMap: Record<FontSize, string> = {
    small: '14px',
    default: '16px',
    large: '18px',
  }
  document.documentElement.style.fontSize = sizeMap[size]
}

function applyAccentColor(color: string) {
  document.documentElement.style.setProperty('--color-primary', color)
}

function applySidebarDensity(density: SidebarDensity) {
  document.documentElement.setAttribute('data-density', density)
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      theme: 'system',
      accentColor: '#4F46E5',
      sidebarDensity: 'default',
      fontSize: 'default',

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      setAccentColor: (color) => {
        applyAccentColor(color)
        set({ accentColor: color })
      },

      setSidebarDensity: (density) => {
        applySidebarDensity(density)
        set({ sidebarDensity: density })
      },

      setFontSize: (size) => {
        applyFontSize(size)
        set({ fontSize: size })
      },
    }),
    {
      name: 'signof-appearance-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
          applyAccentColor(state.accentColor)
          applyFontSize(state.fontSize)
          applySidebarDensity(state.sidebarDensity)
        }
      },
    }
  )
)
