// ─── Encrypted Storage Adapter ─────────────────────────────────────────
//
// AES-GCM 256-bit encryption for Zustand persist middleware.
// Encrypts PII at rest in localStorage using the Web Crypto API.
// Key is stored as JWK in a separate localStorage entry.

import type { StateStorage } from 'zustand/middleware'

const KEY_STORAGE_KEY = 'origina-ek'
const IV_LENGTH = 12

// ─── Key Management ────────────────────────────────────────────────────

async function getOrCreateKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(KEY_STORAGE_KEY)
  if (stored) {
    const jwk = JSON.parse(stored) as JsonWebKey
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )
  }

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )

  const jwk = await crypto.subtle.exportKey('jwk', key)
  localStorage.setItem(KEY_STORAGE_KEY, JSON.stringify(jwk))
  return key
}

// Singleton promise — avoids generating multiple keys on concurrent calls
let keyPromise: Promise<CryptoKey> | null = null

function ensureKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = getOrCreateKey()
  }
  return keyPromise
}

/** @internal Reset cached key — only for tests */
export function _resetKeyCache(): void {
  keyPromise = null
}

// ─── Encrypt / Decrypt ─────────────────────────────────────────────────

async function encrypt(plaintext: string): Promise<string> {
  const key = await ensureKey()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoded = new TextEncoder().encode(plaintext)

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  )

  // Pack IV + ciphertext into a single Uint8Array, then base64-encode
  const packed = new Uint8Array(iv.length + cipherBuffer.byteLength)
  packed.set(iv, 0)
  packed.set(new Uint8Array(cipherBuffer), iv.length)

  return btoa(String.fromCharCode(...packed))
}

async function decrypt(ciphertext: string): Promise<string> {
  const key = await ensureKey()
  const packed = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))

  const iv = packed.slice(0, IV_LENGTH)
  const data = packed.slice(IV_LENGTH)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data,
  )

  return new TextDecoder().decode(plainBuffer)
}

// ─── Zustand StateStorage Adapter ──────────────────────────────────────

export function createEncryptedStorage(): StateStorage {
  return {
    getItem: async (name: string): Promise<string | null> => {
      const raw = localStorage.getItem(name)
      if (raw === null) return null

      try {
        return await decrypt(raw)
      } catch {
        // If decryption fails (e.g. data was stored unencrypted before
        // migration), try returning the raw value. The persist middleware
        // will re-serialize and the next write will encrypt it.
        return raw
      }
    },

    setItem: async (name: string, value: string): Promise<void> => {
      const encrypted = await encrypt(value)
      localStorage.setItem(name, encrypted)
    },

    removeItem: (name: string): void => {
      localStorage.removeItem(name)
    },
  }
}
