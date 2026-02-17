import { useFavoritesStore } from './useFavoritesStore'

describe('useFavoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [], recents: [] })
  })

  describe('favorites', () => {
    it('adds a favorite', () => {
      useFavoritesStore.getState().addFavorite({
        id: 'doc-1',
        type: 'document',
        moduleId: 'documents',
        title: 'Test Doc',
        path: '/documents/doc-1',
        icon: 'file',
      })

      const { favorites } = useFavoritesStore.getState()
      expect(favorites).toHaveLength(1)
      const first = favorites[0]!
      expect(first.id).toBe('doc-1')
      expect(first.title).toBe('Test Doc')
      expect(first.pinnedAt).toBeTruthy()
    })

    it('does not add duplicate favorites', () => {
      const item = {
        id: 'doc-1',
        type: 'document' as const,
        moduleId: 'documents',
        title: 'Test Doc',
        path: '/documents/doc-1',
        icon: 'file',
      }

      useFavoritesStore.getState().addFavorite(item)
      useFavoritesStore.getState().addFavorite(item)

      expect(useFavoritesStore.getState().favorites).toHaveLength(1)
    })

    it('removes a favorite', () => {
      useFavoritesStore.getState().addFavorite({
        id: 'doc-1',
        type: 'document',
        moduleId: 'documents',
        title: 'Test Doc',
        path: '/documents/doc-1',
        icon: 'file',
      })

      useFavoritesStore.getState().removeFavorite('doc-1')
      expect(useFavoritesStore.getState().favorites).toHaveLength(0)
    })

    it('isFavorite returns true for favorited items', () => {
      useFavoritesStore.getState().addFavorite({
        id: 'doc-1',
        type: 'document',
        moduleId: 'documents',
        title: 'Test Doc',
        path: '/documents/doc-1',
        icon: 'file',
      })

      expect(useFavoritesStore.getState().isFavorite('doc-1')).toBe(true)
      expect(useFavoritesStore.getState().isFavorite('doc-2')).toBe(false)
    })

    it('reorders favorites', () => {
      useFavoritesStore.getState().addFavorite({
        id: 'a', type: 'document', moduleId: 'documents', title: 'A', path: '/a', icon: 'a',
      })
      useFavoritesStore.getState().addFavorite({
        id: 'b', type: 'page', moduleId: 'pages', title: 'B', path: '/b', icon: 'b',
      })
      useFavoritesStore.getState().addFavorite({
        id: 'c', type: 'project', moduleId: 'projects', title: 'C', path: '/c', icon: 'c',
      })

      useFavoritesStore.getState().reorderFavorites(0, 2)

      const ids = useFavoritesStore.getState().favorites.map((f) => f.id)
      expect(ids).toEqual(['b', 'c', 'a'])
    })

    it('getFavoritesByModule filters correctly', () => {
      useFavoritesStore.getState().addFavorite({
        id: 'doc-1', type: 'document', moduleId: 'documents', title: 'Doc', path: '/d', icon: 'f',
      })
      useFavoritesStore.getState().addFavorite({
        id: 'page-1', type: 'page', moduleId: 'pages', title: 'Page', path: '/p', icon: 'f',
      })

      const docFavs = useFavoritesStore.getState().getFavoritesByModule('documents')
      expect(docFavs).toHaveLength(1)
      expect(docFavs[0]!.id).toBe('doc-1')
    })
  })

  describe('recents', () => {
    it('tracks a recent item', () => {
      useFavoritesStore.getState().trackRecent({
        id: 'doc-1',
        type: 'document',
        moduleId: 'documents',
        title: 'Test Doc',
        path: '/documents/doc-1',
        icon: 'file',
      })

      const { recents } = useFavoritesStore.getState()
      expect(recents).toHaveLength(1)
      const first = recents[0]!
      expect(first.id).toBe('doc-1')
      expect(first.accessCount).toBe(1)
      expect(first.accessedAt).toBeTruthy()
    })

    it('upserts existing recent item and increments count', () => {
      const item = {
        id: 'doc-1',
        type: 'document' as const,
        moduleId: 'documents',
        title: 'Test Doc',
        path: '/documents/doc-1',
        icon: 'file',
      }

      useFavoritesStore.getState().trackRecent(item)
      useFavoritesStore.getState().trackRecent(item)

      const { recents } = useFavoritesStore.getState()
      expect(recents).toHaveLength(1)
      expect(recents[0]!.accessCount).toBe(2)
    })

    it('moves re-accessed item to front', () => {
      useFavoritesStore.getState().trackRecent({
        id: 'a', type: 'document', moduleId: 'documents', title: 'A', path: '/a', icon: 'a',
      })
      useFavoritesStore.getState().trackRecent({
        id: 'b', type: 'page', moduleId: 'pages', title: 'B', path: '/b', icon: 'b',
      })
      // Re-access 'a'
      useFavoritesStore.getState().trackRecent({
        id: 'a', type: 'document', moduleId: 'documents', title: 'A', path: '/a', icon: 'a',
      })

      const ids = useFavoritesStore.getState().recents.map((r) => r.id)
      expect(ids).toEqual(['a', 'b'])
    })

    it('caps recents at 50 items', () => {
      for (let i = 0; i < 55; i++) {
        useFavoritesStore.getState().trackRecent({
          id: `item-${i}`,
          type: 'document',
          moduleId: 'documents',
          title: `Item ${i}`,
          path: `/items/${i}`,
          icon: 'file',
        })
      }

      expect(useFavoritesStore.getState().recents).toHaveLength(50)
    })

    it('getRecentsByModule filters correctly', () => {
      useFavoritesStore.getState().trackRecent({
        id: 'doc-1', type: 'document', moduleId: 'documents', title: 'Doc', path: '/d', icon: 'f',
      })
      useFavoritesStore.getState().trackRecent({
        id: 'page-1', type: 'page', moduleId: 'pages', title: 'Page', path: '/p', icon: 'f',
      })

      const docRecents = useFavoritesStore.getState().getRecentsByModule('documents')
      expect(docRecents).toHaveLength(1)
      expect(docRecents[0]!.id).toBe('doc-1')
    })

    it('clears all recents', () => {
      useFavoritesStore.getState().trackRecent({
        id: 'doc-1', type: 'document', moduleId: 'documents', title: 'Doc', path: '/d', icon: 'f',
      })

      useFavoritesStore.getState().clearRecents()
      expect(useFavoritesStore.getState().recents).toHaveLength(0)
    })
  })
})
