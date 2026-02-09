import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface AppState {
  // Sidebar
  sidebarExpanded: boolean
  sidebarWidth: number
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void

  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void

  // Command Palette
  commandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void

  // User preferences
  compactMode: boolean
  setCompactMode: (compact: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarExpanded: true,
      sidebarWidth: 240,
      toggleSidebar: () =>
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Command Palette
      commandPaletteOpen: false,
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      // User preferences
      compactMode: false,
      setCompactMode: (compact) => set({ compactMode: compact }),
    }),
    {
      name: 'signof-app-storage',
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        theme: state.theme,
        compactMode: state.compactMode,
      }),
    }
  )
)
