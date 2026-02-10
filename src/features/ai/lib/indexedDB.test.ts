import type { MemoryEntry } from '../types'

// ─── Fake IndexedDB Implementation ──────────────────────────────────
const fakeStore = new Map<string, MemoryEntry>()

function createRequest<T>(result: T): IDBRequest<T> {
  const req = {
    result,
    error: null as DOMException | null,
    onsuccess: null as ((ev: Event) => void) | null,
    onerror: null as ((ev: Event) => void) | null,
  }
  // Fire onsuccess asynchronously (microtask)
  Promise.resolve().then(() => {
    req.onsuccess?.({} as Event)
  })
  return req as unknown as IDBRequest<T>
}

function createTransaction(): IDBTransaction {
  const tx = {
    objectStore: () => ({
      getAll: () => createRequest(Array.from(fakeStore.values())),
      get: (id: string) => createRequest(fakeStore.get(id)),
      put: (entry: MemoryEntry) => {
        fakeStore.set(entry.id, entry)
        return createRequest(undefined)
      },
      delete: (id: string) => {
        fakeStore.delete(id)
        return createRequest(undefined)
      },
      clear: () => {
        fakeStore.clear()
        return createRequest(undefined)
      },
    }),
    oncomplete: null as (() => void) | null,
    onerror: null as (() => void) | null,
    error: null,
  }
  Promise.resolve().then(() => {
    tx.oncomplete?.()
  })
  return tx as unknown as IDBTransaction
}

const fakeDB = {
  transaction: () => createTransaction(),
  close: vi.fn(),
  objectStoreNames: { contains: () => false },
  createObjectStore: vi.fn(),
}

const fakeOpenRequest = {
  result: fakeDB,
  error: null,
  onsuccess: null as ((ev: Event) => void) | null,
  onerror: null as ((ev: Event) => void) | null,
  onupgradeneeded: null as ((ev: Event) => void) | null,
}

vi.stubGlobal('indexedDB', {
  open: () => {
    Promise.resolve().then(() => {
      fakeOpenRequest.onupgradeneeded?.({} as Event)
      fakeOpenRequest.onsuccess?.({} as Event)
    })
    return fakeOpenRequest
  },
})

// Import after mocking
import { getAllEntries, getEntry, putEntry, deleteEntry, clearEntries, exportAllEntries, importEntries } from './indexedDB'

const makeEntry = (id: string, content = 'test content'): MemoryEntry => ({
  id,
  title: `Entry ${id}`,
  content,
  category: 'facts',
  tags: ['test'],
  scope: 'workspace',
  tokenCount: Math.ceil(content.length / 4),
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
})

describe('indexedDB wrapper', () => {
  beforeEach(() => {
    fakeStore.clear()
    fakeDB.close.mockClear()
  })

  it('getAllEntries returns empty array when no entries', async () => {
    const entries = await getAllEntries()
    expect(entries).toEqual([])
  })

  it('putEntry stores an entry and getEntry retrieves it', async () => {
    const entry = makeEntry('1')
    await putEntry(entry)
    expect(fakeStore.has('1')).toBe(true)

    const retrieved = await getEntry('1')
    expect(retrieved).toEqual(entry)
  })

  it('getEntry returns undefined for missing id', async () => {
    const result = await getEntry('nonexistent')
    expect(result).toBeUndefined()
  })

  it('getAllEntries returns all stored entries', async () => {
    await putEntry(makeEntry('a'))
    await putEntry(makeEntry('b'))
    const all = await getAllEntries()
    expect(all).toHaveLength(2)
  })

  it('deleteEntry removes an entry', async () => {
    await putEntry(makeEntry('del'))
    await deleteEntry('del')
    expect(fakeStore.has('del')).toBe(false)
  })

  it('clearEntries removes all entries', async () => {
    await putEntry(makeEntry('x'))
    await putEntry(makeEntry('y'))
    await clearEntries()
    expect(fakeStore.size).toBe(0)
  })

  it('exportAllEntries returns all entries', async () => {
    await putEntry(makeEntry('e1'))
    const exported = await exportAllEntries()
    expect(exported).toHaveLength(1)
    expect(exported[0]!.id).toBe('e1')
  })

  it('importEntries clears and replaces entries', async () => {
    await putEntry(makeEntry('old'))
    const newEntries = [makeEntry('new1'), makeEntry('new2')]
    await importEntries(newEntries)
    expect(fakeStore.size).toBe(2)
    expect(fakeStore.has('old')).toBe(false)
    expect(fakeStore.has('new1')).toBe(true)
    expect(fakeStore.has('new2')).toBe(true)
  })

  it('closes the database after operations', async () => {
    await getAllEntries()
    expect(fakeDB.close).toHaveBeenCalled()
  })
})
