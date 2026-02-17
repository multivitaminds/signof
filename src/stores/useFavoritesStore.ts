import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Item Type (const object pattern) ──────────────────────────────
export const FavoriteItemType = {
  Document: 'document',
  Page: 'page',
  Project: 'project',
  Database: 'database',
  Event: 'event',
  Contact: 'contact',
} as const

export type FavoriteItemType = (typeof FavoriteItemType)[keyof typeof FavoriteItemType]

// ─── Interfaces ────────────────────────────────────────────────────
export interface FavoriteItem {
  id: string
  type: FavoriteItemType
  moduleId: string
  title: string
  path: string
  icon: string
  pinnedAt: string
}

export interface RecentItem {
  id: string
  type: FavoriteItemType
  moduleId: string
  title: string
  path: string
  icon: string
  accessedAt: string
  accessCount: number
}

const MAX_RECENTS = 50

interface FavoritesState {
  favorites: FavoriteItem[]
  recents: RecentItem[]

  addFavorite: (item: Omit<FavoriteItem, 'pinnedAt'>) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  reorderFavorites: (fromIndex: number, toIndex: number) => void

  trackRecent: (item: Omit<RecentItem, 'accessedAt' | 'accessCount'>) => void
  getRecentsByModule: (moduleId: string) => RecentItem[]
  getFavoritesByModule: (moduleId: string) => FavoriteItem[]
  clearRecents: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      recents: [],

      addFavorite: (item) =>
        set((state) => {
          if (state.favorites.some((f) => f.id === item.id)) return state
          const newItem: FavoriteItem = {
            ...item,
            pinnedAt: new Date().toISOString(),
          }
          return { favorites: [...state.favorites, newItem] }
        }),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      reorderFavorites: (fromIndex, toIndex) =>
        set((state) => {
          const items = [...state.favorites]
          const removed = items.splice(fromIndex, 1)
          if (removed[0]) {
            items.splice(toIndex, 0, removed[0])
          }
          return { favorites: items }
        }),

      trackRecent: (item) =>
        set((state) => {
          const existing = state.recents.find((r) => r.id === item.id)
          if (existing) {
            const updated = state.recents.map((r) =>
              r.id === item.id
                ? {
                    ...r,
                    accessedAt: new Date().toISOString(),
                    accessCount: r.accessCount + 1,
                    title: item.title,
                    path: item.path,
                  }
                : r
            )
            // Move to front
            const target = updated.find((r) => r.id === item.id)!
            const rest = updated.filter((r) => r.id !== item.id)
            return { recents: [target, ...rest] }
          }
          const newItem: RecentItem = {
            ...item,
            accessedAt: new Date().toISOString(),
            accessCount: 1,
          }
          const recents = [newItem, ...state.recents].slice(0, MAX_RECENTS)
          return { recents }
        }),

      getRecentsByModule: (moduleId) =>
        get().recents.filter((r) => r.moduleId === moduleId),

      getFavoritesByModule: (moduleId) =>
        get().favorites.filter((f) => f.moduleId === moduleId),

      clearRecents: () => set({ recents: [] }),
    }),
    {
      name: 'orchestree-favorites-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        recents: state.recents,
      }),
    }
  )
)

export default useFavoritesStore
