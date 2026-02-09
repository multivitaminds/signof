import '@testing-library/jest-dom/vitest'

// ─── localStorage mock (jsdom doesn't provide a full implementation) ──
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// ─── Clear persisted state between tests ────────────────────────────
beforeEach(() => {
  localStorageMock.clear()
  document.documentElement.removeAttribute('data-theme')
})

// ─── Canvas mock (for SignaturePad and any future canvas components) ──
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  scale: vi.fn(),
  set strokeStyle(_v: string) {},
  set lineWidth(_v: number) {},
  set lineCap(_v: string) {},
  set lineJoin(_v: string) {},
}) as unknown as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,')

// ─── ResizeObserver mock (not in jsdom) ─────────────────────────────
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// ─── matchMedia mock (for dark mode / prefers-reduced-motion) ───────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
