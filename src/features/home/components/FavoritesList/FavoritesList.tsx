import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useFavoritesStore } from '../../../../stores/useFavoritesStore'
import './FavoritesList.css'

export default function FavoritesList() {
  const navigate = useNavigate()
  const favorites = useFavoritesStore((s) => s.favorites)

  const handleClick = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate]
  )

  return (
    <div className="favorites-list">
      <div className="favorites-list__header">
        <Star size={14} className="favorites-list__header-icon" />
        <span className="favorites-list__title">Favorites</span>
      </div>
      {favorites.length > 0 ? (
        <ul className="favorites-list__items">
          {favorites.map((fav) => (
            <li key={fav.id} className="favorites-list__item">
              <button
                className="favorites-list__link"
                onClick={() => handleClick(fav.path)}
                title={fav.title}
              >
                <span className="favorites-list__icon">{fav.icon}</span>
                <span className="favorites-list__label">{fav.title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="favorites-list__empty">Star items to pin them here</p>
      )}
    </div>
  )
}
