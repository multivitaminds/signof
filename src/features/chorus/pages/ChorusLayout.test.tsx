import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ChorusLayout from './ChorusLayout'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'

// Mock the ThreadPanel to avoid deep dependency chain
vi.mock('../components/ThreadPanel/ThreadPanel', () => ({
  default: () => <div data-testid="thread-panel">Thread Panel</div>,
}))

// Mock the ChorusSidebar
vi.mock('../components/ChorusSidebar/ChorusSidebar', () => ({
  default: () => <nav data-testid="chorus-sidebar">Sidebar</nav>,
}))

function renderWithRouter(initialEntry = '/chorus/channels/general') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/chorus" element={<ChorusLayout />}>
          <Route path="channels/:channelId" element={<div>Channel Page</div>} />
          <Route path="dm/:dmId" element={<div>DM Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ChorusLayout', () => {
  beforeEach(() => {
    useChorusStore.setState({
      channels: [],
      directMessages: [],
      users: [],
      threadPanelOpen: false,
    })
    useChorusMessageStore.setState({ messages: {} })
  })

  it('renders the sidebar', () => {
    renderWithRouter()
    expect(screen.getByTestId('chorus-sidebar')).toBeInTheDocument()
  })

  it('renders the main content area', () => {
    renderWithRouter()
    expect(screen.getByText('Channel Page')).toBeInTheDocument()
  })

  it('does not render thread panel when closed', () => {
    renderWithRouter()
    expect(screen.queryByTestId('thread-panel')).not.toBeInTheDocument()
  })

  it('renders thread panel when open', () => {
    useChorusStore.setState({ threadPanelOpen: true })
    renderWithRouter()
    expect(screen.getByTestId('thread-panel')).toBeInTheDocument()
  })
})
