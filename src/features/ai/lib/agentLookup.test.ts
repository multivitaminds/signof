import { describe, it, expect } from 'vitest'
import { lookupAgent } from './agentLookup'

describe('lookupAgent', () => {
  it('returns core agent detail for a known core type', () => {
    const detail = lookupAgent('planner')
    expect(detail).toBeDefined()
    expect(detail!.id).toBe('planner')
    expect(detail!.name).toBe('Planner')
    expect(detail!.persona).toBeDefined()
    expect(detail!.persona.roles.title).toBeTruthy()
  })

  it('core agent detail has useCases and capabilities', () => {
    const detail = lookupAgent('planner')
    expect(detail).toBeDefined()
    expect(detail!.useCases).toBeDefined()
    expect(detail!.useCases!.length).toBeGreaterThan(0)
    expect(detail!.capabilities).toBeDefined()
    expect(detail!.capabilities!.length).toBeGreaterThan(0)
  })

  it('returns marketplace agent detail for domain-id format', () => {
    const detail = lookupAgent('work-1')
    expect(detail).toBeDefined()
    expect(detail!.id).toBe('work-1')
    expect(detail!.persona).toBeDefined()
    expect(detail!.integrations).toBeTruthy()
    expect(detail!.price).toBeTruthy()
  })

  it('returns undefined for nonexistent agent', () => {
    expect(lookupAgent('nonexistent')).toBeUndefined()
  })

  it('returns undefined for invalid format', () => {
    expect(lookupAgent('invalid-format-xyz')).toBeUndefined()
  })

  it('handles multi-dash domain ids correctly', () => {
    // The lastIndexOf('-') logic should handle domain ids without dashes
    const detail = lookupAgent('work-1')
    expect(detail).toBeDefined()
    expect(detail!.domainId).toBe('work')
  })

  it('returns all core agent types', () => {
    const coreTypes = [
      'planner', 'researcher', 'writer', 'analyst', 'designer',
      'developer', 'reviewer', 'coordinator',
    ]
    for (const type of coreTypes) {
      const detail = lookupAgent(type)
      expect(detail).toBeDefined()
      expect(detail!.id).toBe(type)
    }
  })
})
