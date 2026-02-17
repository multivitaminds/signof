import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useFavoritesStore } from '../stores/useFavoritesStore'
import type { FavoriteItemType } from '../stores/useFavoritesStore'

interface TrackableItem {
  id: string
  type: FavoriteItemType
  moduleId: string
  title: string
  icon: string
}

export function useTrackPageVisit(item?: TrackableItem) {
  const location = useLocation()
  const trackRecent = useFavoritesStore((s) => s.trackRecent)

  useEffect(() => {
    if (item) {
      trackRecent({ ...item, path: location.pathname })
    }
  }, [item?.id, location.pathname, trackRecent])
}
