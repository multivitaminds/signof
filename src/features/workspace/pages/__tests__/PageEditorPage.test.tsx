import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PageEditorPage from '../PageEditorPage'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { Block, Page } from '../../types'
import { BlockType } from '../../types'

// Mock canvas for Tiptap
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    canvas: { width: 300, height: 150 },
  })

  // Mock ResizeObserver
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock clipboard
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

function renderPage(pageId: string) {
  return render(
    <MemoryRouter initialEntries={[`/pages/${pageId}`]}>
      <Routes>
        <Route path="/pages/:pageId" element={<PageEditorPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PageEditorPage', () => {
  const testBlock: Block = {
    id: 'block-1',
    type: BlockType.Paragraph,
    content: 'Hello world',
    marks: [],
    properties: {},
    children: [],
  }

  const testPage: Page = {
    id: 'test-page',
    title: 'Test Page',
    icon: '📄',
    coverUrl: '',
    parentId: null,
    blockIds: ['block-1'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    isFavorite: false,
    lastViewedAt: null,
    trashedAt: null,
    properties: {},
  }

  beforeEach(() => {
    useWorkspaceStore.setState({
      ...useWorkspaceStore.getInitialState(),
      pages: { 'test-page': testPage },
      blocks: { 'block-1': testBlock },
      comments: {}, // No comments — this was the crash trigger
    })
  })

  it('renders without "Maximum update depth exceeded" error', () => {
    // This test verifies the fix for the infinite re-render loop
    // caused by Zustand selectors returning new [] references
    expect(() => renderPage('test-page')).not.toThrow()
  })

  it('renders the page title', () => {
    renderPage('test-page')
    // Title appears in both breadcrumb and page header
    const titles = screen.getAllByText('Test Page')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders not-found state for missing page', () => {
    renderPage('nonexistent')
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders with empty comments without crashing', () => {
    // Explicitly set comments to empty object — the exact scenario that caused the bug
    useWorkspaceStore.setState({ comments: {} })
    expect(() => renderPage('test-page')).not.toThrow()
    const titles = screen.getAllByText('Test Page')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })
})
