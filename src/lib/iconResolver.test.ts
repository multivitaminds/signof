import { describe, it, expect } from 'vitest'
import { resolveIcon } from './iconResolver'

describe('iconResolver', () => {
  it('resolves a known icon name', () => {
    const icon = resolveIcon('home')
    expect(icon).not.toBeNull()
    expect(icon).toBeDefined()
  })

  it('resolves multiple known icons', () => {
    const knownNames = [
      'file-text', 'calendar', 'database', 'settings', 'bot',
      'inbox', 'brain', 'plus', 'upload', 'download',
    ]
    for (const name of knownNames) {
      expect(resolveIcon(name)).not.toBeNull()
    }
  })

  it('returns null for an unknown icon name', () => {
    expect(resolveIcon('nonexistent-icon')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(resolveIcon('')).toBeNull()
  })
})
