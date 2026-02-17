import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FavoriteButton from './FavoriteButton'
import { useFavoritesStore } from '../../../stores/useFavoritesStore'

describe('FavoriteButton', () => {
  const testItem = {
    id: 'doc-1',
    type: 'document' as const,
    moduleId: 'documents',
    title: 'Test Document',
    path: '/documents/doc-1',
    icon: 'file',
  }

  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [], recents: [] })
  })

  it('renders with outline star when not favorited', () => {
    render(<FavoriteButton itemId="doc-1" item={testItem} />)
    const btn = screen.getByLabelText('Add Test Document to favorites')
    expect(btn).toBeInTheDocument()
    expect(btn).not.toHaveClass('favorite-button--active')
  })

  it('renders with filled star when favorited', () => {
    useFavoritesStore.getState().addFavorite(testItem)
    render(<FavoriteButton itemId="doc-1" item={testItem} />)
    const btn = screen.getByLabelText('Remove Test Document from favorites')
    expect(btn).toHaveClass('favorite-button--active')
  })

  it('toggles favorite on click — adds', async () => {
    const user = userEvent.setup()
    render(<FavoriteButton itemId="doc-1" item={testItem} />)

    await user.click(screen.getByLabelText('Add Test Document to favorites'))
    expect(useFavoritesStore.getState().favorites).toHaveLength(1)
    expect(useFavoritesStore.getState().favorites[0]!.id).toBe('doc-1')
  })

  it('toggles favorite on click — removes', async () => {
    const user = userEvent.setup()
    useFavoritesStore.getState().addFavorite(testItem)
    render(<FavoriteButton itemId="doc-1" item={testItem} />)

    await user.click(screen.getByLabelText('Remove Test Document from favorites'))
    expect(useFavoritesStore.getState().favorites).toHaveLength(0)
  })
})
