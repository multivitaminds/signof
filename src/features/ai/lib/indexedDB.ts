import type { MemoryEntry } from '../types'

const DB_NAME = 'signof-ai-memory'
const DB_VERSION = 1
const STORE_NAME = 'entries'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function txPromise<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)
    const request = fn(store)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllEntries(): Promise<MemoryEntry[]> {
  const db = await openDB()
  try {
    return await txPromise(db, 'readonly', (store) => store.getAll())
  } finally {
    db.close()
  }
}

export async function getEntry(id: string): Promise<MemoryEntry | undefined> {
  const db = await openDB()
  try {
    return await txPromise(db, 'readonly', (store) => store.get(id))
  } finally {
    db.close()
  }
}

export async function putEntry(entry: MemoryEntry): Promise<void> {
  const db = await openDB()
  try {
    await txPromise<unknown>(db, 'readwrite', (store) => store.put(entry) as IDBRequest<unknown>)
  } finally {
    db.close()
  }
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDB()
  try {
    await txPromise<unknown>(db, 'readwrite', (store) => store.delete(id) as IDBRequest<unknown>)
  } finally {
    db.close()
  }
}

export async function clearEntries(): Promise<void> {
  const db = await openDB()
  try {
    await txPromise<unknown>(db, 'readwrite', (store) => store.clear() as IDBRequest<unknown>)
  } finally {
    db.close()
  }
}

export async function exportAllEntries(): Promise<MemoryEntry[]> {
  return getAllEntries()
}

export async function importEntries(entries: MemoryEntry[]): Promise<void> {
  const db = await openDB()
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    for (const entry of entries) {
      store.put(entry)
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}
