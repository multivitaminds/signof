import { useCallback } from 'react'
import { Star } from 'lucide-react'
import { useFavoritesStore } from '../../../stores/useFavoritesStore'
import type { FavoriteItemType } from '../../../stores/useFavoritesStore'
import './FavoriteButton.css'

interface FavoriteButtonProps {
  itemId: string
  item: {
    id: string
    type: FavoriteItemType
    moduleId: string
    title: string
    path: string
    icon: string
  }
  size?: number
}

export default function FavoriteButton({ itemId, item, size = 18 }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((s) => s.favorites.some((f) => f.id === itemId))
  const addFavorite = useFavoritesStore((s) => s.addFavorite)
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite)

  const handleToggle = useCallback(() => {
    if (isFavorite) {
      removeFavorite(itemId)
    } else {
      addFavorite(item)
    }
  }, [isFavorite, itemId, item, addFavorite, removeFavorite])

  return (
    <button
      className={`favorite-button ${isFavorite ? 'favorite-button--active' : ''}`}
      onClick={handleToggle}
      aria-label={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
    >
      <Star
        size={size}
        className="favorite-button__icon"
        fill={isFavorite ? 'currentColor' : 'none'}
      />
    </button>
  )
}
