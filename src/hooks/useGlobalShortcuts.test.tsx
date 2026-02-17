import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useGlobalShortcuts } from './useGlobalShortcuts'
import { useAppStore } from '../stores/useAppStore'
import { getAllShortcuts, clearRegistry } from '../lib/shortcutRegistry'

// Mock react-router-dom navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

// In jsdom, navigator.platform is empty string, so isMac() returns false.
// The hook uses ctrlKey (not metaKey) as the modifier in non-Mac environments.
function dispatchModKey(key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    ctrlKey: true,
    bubbles: true,
  })
  document.dispatchEvent(event)
}

describe('useGlobalShortcuts', () => {
  beforeEach(() => {
    clearRegistry()
    mockNavigate.mockClear()
    useAppStore.setState({
      searchOverlayOpen: false,
      shortcutHelpOpen: false,
      sidebarExpanded: true,
    })
  })

  it('registers global shortcuts into the registry', () => {
    renderHook(() => useGlobalShortcuts(), { wrapper })

    const all = getAllShortcuts()
    expect(all.length).toBeGreaterThan(0)

    const ids = all.map((s) => s.id)
    expect(ids).toContain('global:search')
    expect(ids).toContain('global:shortcuts')
    expect(ids).toContain('global:toggle-sidebar')
    expect(ids).toContain('global:settings')
    expect(ids).toContain('global:new-item')
  })

  it('registers module navigation shortcuts mod+1 through mod+9', () => {
    renderHook(() => useGlobalShortcuts(), { wrapper })

    const all = getAllShortcuts()
    for (let i = 1; i <= 9; i++) {
      expect(all.find((s) => s.id === `global:module-${i}`)).toBeTruthy()
    }
  })

  it('unregisters shortcuts on unmount', () => {
    const { unmount } = renderHook(() => useGlobalShortcuts(), { wrapper })
    expect(getAllShortcuts().length).toBeGreaterThan(0)

    unmount()
    expect(getAllShortcuts()).toHaveLength(0)
  })

  it('mod+k opens the search overlay', () => {
    renderHook(() => useGlobalShortcuts(), { wrapper })
    dispatchModKey('k')
    expect(useAppStore.getState().searchOverlayOpen).toBe(true)
  })

  it('mod+b toggles sidebar', () => {
    useAppStore.setState({ sidebarExpanded: true })
    renderHook(() => useGlobalShortcuts(), { wrapper })
    dispatchModKey('b')
    expect(useAppStore.getState().sidebarExpanded).toBe(false)
  })

  it('mod+1 navigates to home', () => {
    renderHook(() => useGlobalShortcuts(), { wrapper })
    dispatchModKey('1')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('mod+, navigates to settings', () => {
    renderHook(() => useGlobalShortcuts(), { wrapper })
    dispatchModKey(',')
    expect(mockNavigate).toHaveBeenCalledWith('/settings')
  })
})
