import { useAutoCaptureStore, isAutoCaptured } from './useAutoCapture'

describe('useAutoCaptureStore', () => {
  beforeEach(() => {
    useAutoCaptureStore.setState({ enabled: true, capturedIds: [] })
  })

  it('initializes with enabled=true', () => {
    expect(useAutoCaptureStore.getState().enabled).toBe(true)
  })

  it('initializes with empty capturedIds', () => {
    expect(useAutoCaptureStore.getState().capturedIds).toEqual([])
  })

  it('toggles enabled state', () => {
    useAutoCaptureStore.getState().toggleEnabled()
    expect(useAutoCaptureStore.getState().enabled).toBe(false)

    useAutoCaptureStore.getState().toggleEnabled()
    expect(useAutoCaptureStore.getState().enabled).toBe(true)
  })

  it('sets enabled state directly', () => {
    useAutoCaptureStore.getState().setEnabled(false)
    expect(useAutoCaptureStore.getState().enabled).toBe(false)

    useAutoCaptureStore.getState().setEnabled(true)
    expect(useAutoCaptureStore.getState().enabled).toBe(true)
  })

  it('adds captured IDs', () => {
    useAutoCaptureStore.getState().addCapturedId('entry-1')
    expect(useAutoCaptureStore.getState().capturedIds).toEqual(['entry-1'])

    useAutoCaptureStore.getState().addCapturedId('entry-2')
    expect(useAutoCaptureStore.getState().capturedIds).toEqual(['entry-1', 'entry-2'])
  })
})

describe('isAutoCaptured', () => {
  it('returns true when tags include "auto-captured"', () => {
    expect(isAutoCaptured(['auto-captured', 'document-created'])).toBe(true)
  })

  it('returns false when tags do not include "auto-captured"', () => {
    expect(isAutoCaptured(['manual', 'document-created'])).toBe(false)
  })

  it('returns false for empty tags', () => {
    expect(isAutoCaptured([])).toBe(false)
  })
})
