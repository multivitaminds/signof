import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TopBar from './TopBar'
import { useAppStore } from '../../../stores/useAppStore'

vi.mock('../../../features/ai/stores/useAIChatStore', () => ({
  __esModule: true,
  default: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ isOpen: false, toggleOpen: vi.fn() }),
}))

vi.mock('../../Breadcrumbs/Breadcrumbs', () => ({
  default: () => <nav aria-label="Breadcrumbs">Home</nav>,
}))

vi.mock('../../NotificationCenter/NotificationCenter', () => ({
  default: () => <div data-testid="notification-center">Notifications</div>,
}))

function renderTopBar() {
  return render(
    <MemoryRouter>
      <TopBar />
    </MemoryRouter>
  )
}

describe('TopBar', () => {
  beforeEach(() => {
    useAppStore.setState({
      commandPaletteOpen: false,
    })
  })

  it('renders the topbar with search and theme buttons', () => {
    renderTopBar()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('User menu')).toBeInTheDocument()
  })

  it('opens profile dropdown on click', async () => {
    const user = userEvent.setup()
    renderTopBar()

    await user.click(screen.getByLabelText('User menu'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Demo User')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('closes profile dropdown on Escape', async () => {
    const user = userEvent.setup()
    renderTopBar()

    await user.click(screen.getByLabelText('User menu'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    const wrapper = screen.getByLabelText('User menu').closest('.topbar__profile-wrapper') as HTMLElement
    fireEvent.keyDown(wrapper, { key: 'Escape' })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('navigates profile menu items with arrow keys', async () => {
    const user = userEvent.setup()
    renderTopBar()

    await user.click(screen.getByLabelText('User menu'))

    const wrapper = screen.getByLabelText('User menu').closest('.topbar__profile-wrapper') as HTMLElement
    const items = screen.getAllByRole('menuitem')

    // Arrow down to first item
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
    expect(items[0]).toHaveClass('topbar__profile-menu-item--focused')

    // Arrow down to second item
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
    expect(items[1]).toHaveClass('topbar__profile-menu-item--focused')
    expect(items[0]).not.toHaveClass('topbar__profile-menu-item--focused')

    // Arrow up back to first
    fireEvent.keyDown(wrapper, { key: 'ArrowUp' })
    expect(items[0]).toHaveClass('topbar__profile-menu-item--focused')
  })

  it('wraps around when arrowing past last item', async () => {
    const user = userEvent.setup()
    renderTopBar()

    await user.click(screen.getByLabelText('User menu'))

    const wrapper = screen.getByLabelText('User menu').closest('.topbar__profile-wrapper') as HTMLElement
    const items = screen.getAllByRole('menuitem')

    // Arrow down 3 times (past the 3 items) wraps to first
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
    fireEvent.keyDown(wrapper, { key: 'ArrowDown' })
    expect(items[0]).toHaveClass('topbar__profile-menu-item--focused')
  })

  it('highlights menu item on mouse enter', async () => {
    const user = userEvent.setup()
    renderTopBar()

    await user.click(screen.getByLabelText('User menu'))

    const items = screen.getAllByRole('menuitem')
    fireEvent.mouseEnter(items[1] as HTMLElement)
    expect(items[1]).toHaveClass('topbar__profile-menu-item--focused')
  })
})
