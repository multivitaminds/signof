import { describe, it, expect, beforeEach } from 'vitest'
import { useContactStore } from './useContactStore'

function resetStore() {
  useContactStore.setState({ contacts: [] })
}

describe('useContactStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('addContact', () => {
    it('adds a contact and returns it with generated id and timestamp', () => {
      const result = useContactStore.getState().addContact({
        name: 'Test Person',
        email: 'test@example.com',
        company: 'Test Inc',
        signingHistory: [],
      })

      expect(result.id).toBeTruthy()
      expect(result.name).toBe('Test Person')
      expect(result.createdAt).toBeTruthy()
      expect(useContactStore.getState().contacts).toHaveLength(1)
    })
  })

  describe('updateContact', () => {
    it('updates a contact by id', () => {
      const contact = useContactStore.getState().addContact({
        name: 'Original',
        email: 'orig@test.com',
        signingHistory: [],
      })

      useContactStore.getState().updateContact(contact.id, { name: 'Updated' })
      const updated = useContactStore.getState().contacts.find((c) => c.id === contact.id)
      expect(updated?.name).toBe('Updated')
    })
  })

  describe('deleteContact', () => {
    it('removes a contact by id', () => {
      const contact = useContactStore.getState().addContact({
        name: 'To Delete',
        email: 'del@test.com',
        signingHistory: [],
      })

      expect(useContactStore.getState().contacts).toHaveLength(1)
      useContactStore.getState().deleteContact(contact.id)
      expect(useContactStore.getState().contacts).toHaveLength(0)
    })
  })

  describe('getContact', () => {
    it('returns a contact by id', () => {
      const contact = useContactStore.getState().addContact({
        name: 'Find Me',
        email: 'find@test.com',
        signingHistory: [],
      })

      expect(useContactStore.getState().getContact(contact.id)?.name).toBe('Find Me')
    })

    it('returns undefined for unknown id', () => {
      expect(useContactStore.getState().getContact('nonexistent')).toBeUndefined()
    })
  })

  describe('searchContacts', () => {
    beforeEach(() => {
      useContactStore.getState().addContact({
        name: 'Alice Johnson',
        email: 'alice@acme.com',
        company: 'Acme Corp',
        signingHistory: [],
      })
      useContactStore.getState().addContact({
        name: 'Bob Smith',
        email: 'bob@globex.com',
        company: 'Globex',
        signingHistory: [],
      })
    })

    it('searches by name', () => {
      const results = useContactStore.getState().searchContacts('alice')
      expect(results).toHaveLength(1)
      expect(results[0]!.name).toBe('Alice Johnson')
    })

    it('searches by email', () => {
      const results = useContactStore.getState().searchContacts('globex')
      expect(results).toHaveLength(1)
      expect(results[0]!.name).toBe('Bob Smith')
    })

    it('searches by company', () => {
      const results = useContactStore.getState().searchContacts('Acme')
      expect(results).toHaveLength(1)
      expect(results[0]!.company).toBe('Acme Corp')
    })

    it('returns all contacts for empty query', () => {
      const results = useContactStore.getState().searchContacts('')
      expect(results).toHaveLength(2)
    })

    it('returns empty array when no match', () => {
      const results = useContactStore.getState().searchContacts('zzzzz')
      expect(results).toHaveLength(0)
    })
  })

  describe('addSigningHistory', () => {
    it('adds a signing history entry to a contact', () => {
      const contact = useContactStore.getState().addContact({
        name: 'Signer',
        email: 'signer@test.com',
        signingHistory: [],
      })

      useContactStore.getState().addSigningHistory(contact.id, {
        documentId: 'doc-1',
        date: '2026-02-10T12:00:00Z',
        status: 'signed',
      })

      const updated = useContactStore.getState().getContact(contact.id)
      expect(updated?.signingHistory).toHaveLength(1)
      expect(updated?.signingHistory[0]!.documentId).toBe('doc-1')
    })
  })
})
