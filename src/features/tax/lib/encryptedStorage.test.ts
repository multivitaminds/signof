import { createEncryptedStorage, _resetKeyCache } from './encryptedStorage'

// Provide a minimal Web Crypto polyfill for the test environment
// (jsdom has no crypto.subtle by default).
const KEY_STORAGE_KEY = 'orchestree-ek'

// Track localStorage calls so we can assert on encrypted values
const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')

// Use the real Web Crypto API if available (Node 20+), otherwise skip
const hasSubtle = typeof globalThis.crypto?.subtle?.generateKey === 'function'

describe.skipIf(!hasSubtle)('createEncryptedStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    _resetKeyCache()
    getItemSpy.mockClear()
    setItemSpy.mockClear()
    removeItemSpy.mockClear()
  })

  it('returns a StateStorage-compatible object', () => {
    const storage = createEncryptedStorage()
    expect(typeof storage.getItem).toBe('function')
    expect(typeof storage.setItem).toBe('function')
    expect(typeof storage.removeItem).toBe('function')
  })

  it('encrypts data on setItem and decrypts on getItem', async () => {
    const storage = createEncryptedStorage()
    const payload = JSON.stringify({ ssn: '123-45-6789', income: 75000 })

    await storage.setItem('test-key', payload)

    // Raw localStorage value should NOT equal the plaintext
    const raw = localStorage.getItem('test-key')
    expect(raw).not.toBeNull()
    expect(raw).not.toBe(payload)

    // Decrypted value should match original
    const decrypted = await storage.getItem('test-key')
    expect(decrypted).toBe(payload)
  })

  it('generates and persists an encryption key on first use', async () => {
    const storage = createEncryptedStorage()
    await storage.setItem('x', 'hello')

    const keyJson = localStorage.getItem(KEY_STORAGE_KEY)
    expect(keyJson).not.toBeNull()

    const jwk = JSON.parse(keyJson!) as JsonWebKey
    expect(jwk.kty).toBe('oct')
    expect(jwk.alg).toBe('A256GCM')
  })

  it('returns null for missing keys', async () => {
    const storage = createEncryptedStorage()
    const result = await storage.getItem('nonexistent')
    expect(result).toBeNull()
  })

  it('removeItem deletes from localStorage', async () => {
    const storage = createEncryptedStorage()
    await storage.setItem('to-remove', 'data')
    expect(localStorage.getItem('to-remove')).not.toBeNull()

    storage.removeItem('to-remove')
    expect(localStorage.getItem('to-remove')).toBeNull()
  })

  it('handles pre-existing unencrypted data gracefully', async () => {
    // Simulate data written before encryption was enabled
    const legacyData = JSON.stringify({ name: 'John' })
    localStorage.setItem('legacy-key', legacyData)

    const storage = createEncryptedStorage()
    const result = await storage.getItem('legacy-key')

    // Should fall back to returning raw value
    expect(result).toBe(legacyData)
  })

  it('produces different ciphertext for the same plaintext (random IV)', async () => {
    const storage = createEncryptedStorage()
    const data = 'same-data'

    await storage.setItem('key-a', data)
    await storage.setItem('key-b', data)

    const rawA = localStorage.getItem('key-a')
    const rawB = localStorage.getItem('key-b')

    expect(rawA).not.toBe(rawB)
  })
})
