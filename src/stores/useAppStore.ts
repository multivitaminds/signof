import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RecentItem, FavoriteItem } from '../types'

interface AppState {
  // Sidebar
  sidebarExpanded: boolean
  sidebarWidth: number
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void

  // Mobile sidebar
  mobileSidebarOpen: boolean
  openMobileSidebar: () => void
  closeMobileSidebar: () => void

  // Command Palette
  commandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void

  // User preferences
  compactMode: boolean
  setCompactMode: (compact: boolean) => void

  // Recent items
  recentItems: RecentItem[]
  addRecentItem: (item: Omit<RecentItem, 'timestamp'>) => void

  // Favorites
  favorites: FavoriteItem[]
  addFavorite: (item: FavoriteItem) => void
  removeFavorite: (id: string) => void
  reorderFavorites: (fromIndex: number, toIndex: number) => void

  // Keyboard shortcut help
  shortcutHelpOpen: boolean
  openShortcutHelp: () => void
  closeShortcutHelp: () => void
  toggleShortcutHelp: () => void

}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarExpanded: true,
      sidebarWidth: 256,
      toggleSidebar: () =>
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.min(320, Math.max(180, width)) }),

      // Mobile sidebar
      mobileSidebarOpen: false,
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

      // Command Palette
      commandPaletteOpen: false,
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      // User preferences
      compactMode: false,
      setCompactMode: (compact) => set({ compactMode: compact }),

      // Recent items
      recentItems: [],
      addRecentItem: (item) =>
        set((state) => {
          const filtered = state.recentItems.filter((r) => r.path !== item.path)
          const newItem: RecentItem = { ...item, timestamp: Date.now() }
          return { recentItems: [newItem, ...filtered].slice(0, 10) }
        }),

      // Favorites
      favorites: [],
      addFavorite: (item) =>
        set((state) => {
          if (state.favorites.some((f) => f.id === item.id)) return state
          return { favorites: [...state.favorites, item] }
        }),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),
      reorderFavorites: (fromIndex, toIndex) =>
        set((state) => {
          const items = [...state.favorites]
          const removed = items.splice(fromIndex, 1)
          if (removed[0]) {
            items.splice(toIndex, 0, removed[0])
          }
          return { favorites: items }
        }),

      // Keyboard shortcut help
      shortcutHelpOpen: false,
      openShortcutHelp: () => set({ shortcutHelpOpen: true }),
      closeShortcutHelp: () => set({ shortcutHelpOpen: false }),
      toggleShortcutHelp: () =>
        set((state) => ({ shortcutHelpOpen: !state.shortcutHelpOpen })),

    }),
    {
      name: 'orchestree-app-storage',
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        sidebarWidth: state.sidebarWidth,
        compactMode: state.compactMode,
        recentItems: state.recentItems,
        favorites: state.favorites,
      }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<AppState>) }
        // Clamp sidebarWidth to valid range on rehydration
        if (typeof merged.sidebarWidth === 'number') {
          merged.sidebarWidth = Math.min(320, Math.max(180, merged.sidebarWidth))
        }
        return merged
      },
    }
  )
)
