import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Contact, ContactSigningHistory } from '../../../types'
import { SAMPLE_CONTACTS } from '../lib/sampleContacts'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

interface ContactState {
  contacts: Contact[]
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
  getContact: (id: string) => Contact | undefined
  searchContacts: (query: string) => Contact[]
  addSigningHistory: (contactId: string, entry: ContactSigningHistory) => void

  // Clear data
  clearData: () => void
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      contacts: SAMPLE_CONTACTS,

      addContact: (contact) => {
        const newContact: Contact = {
          ...contact,
          id: generateId(),
          createdAt: now(),
        }
        set((state) => ({ contacts: [newContact, ...state.contacts] }))
        return newContact
      },

      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }))
      },

      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        }))
      },

      getContact: (id) => {
        return get().contacts.find((c) => c.id === id)
      },

      searchContacts: (query) => {
        const q = query.toLowerCase().trim()
        if (!q) return get().contacts
        return get().contacts.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.company && c.company.toLowerCase().includes(q))
        )
      },

      addSigningHistory: (contactId, entry) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === contactId
              ? { ...c, signingHistory: [...c.signingHistory, entry] }
              : c
          ),
        }))
      },

      clearData: () => {
        set({ contacts: [] })
      },
    }),
    { name: 'origina-contacts' }
  )
)
