import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccountingContact } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createSampleContacts(): AccountingContact[] {
  const now = new Date().toISOString()
  return [
    // Customers
    { id: 'contact-acme', name: 'John Smith', company: 'Acme Corp', email: 'john@acmecorp.com', phone: '(555) 100-1001', type: 'customer', address: '123 Main St, San Francisco, CA 94102', outstandingBalance: 3450, createdAt: now },
    { id: 'contact-globex', name: 'Jane Doe', company: 'Globex Inc', email: 'jane@globex.com', phone: '(555) 200-2002', type: 'customer', address: '456 Oak Ave, New York, NY 10001', outstandingBalance: 5000, createdAt: now },
    { id: 'contact-initech', name: 'Bill Lumbergh', company: 'Initech', email: 'bill@initech.com', phone: '(555) 300-3003', type: 'customer', address: '789 Pine Rd, Austin, TX 73301', outstandingBalance: 2800, createdAt: now },
    { id: 'contact-umbrella', name: 'Albert Wesker', company: 'Umbrella Corp', email: 'albert@umbrella.co', phone: '(555) 400-4004', type: 'customer', address: '321 Elm St, Chicago, IL 60601', outstandingBalance: 1750, createdAt: now },
    { id: 'contact-stark', name: 'Pepper Potts', company: 'Stark Industries', email: 'pepper@stark.com', phone: '(555) 500-5005', type: 'customer', address: '555 Tech Blvd, Los Angeles, CA 90001', outstandingBalance: 0, createdAt: now },
    // Vendors
    { id: 'contact-officedepot', name: 'Vendor Relations', company: 'Office Depot', email: 'orders@officedepot.com', phone: '(800) 463-3768', type: 'vendor', address: '6600 N Military Trail, Boca Raton, FL 33496', outstandingBalance: 450, createdAt: now },
    { id: 'contact-aws', name: 'AWS Support', company: 'Amazon Web Services', email: 'billing@aws.amazon.com', phone: '(800) 372-2447', type: 'vendor', address: '410 Terry Ave N, Seattle, WA 98109', outstandingBalance: 1200, createdAt: now },
    { id: 'contact-wework', name: 'Space Manager', company: 'WeWork', email: 'billing@wework.com', phone: '(855) 493-9675', type: 'vendor', address: '115 W 18th St, New York, NY 10011', outstandingBalance: 3000, createdAt: now },
    { id: 'contact-adp', name: 'Payroll Team', company: 'ADP', email: 'payroll@adp.com', phone: '(800) 225-5237', type: 'vendor', address: '1 ADP Blvd, Roseland, NJ 07068', outstandingBalance: 4500, createdAt: now },
  ]
}

interface AccountingContactState {
  contacts: AccountingContact[]

  addContact: (contact: Omit<AccountingContact, 'id' | 'createdAt'>) => void
  updateContact: (id: string, updates: Partial<AccountingContact>) => void
  deleteContact: (id: string) => void
  getCustomers: () => AccountingContact[]
  getVendors: () => AccountingContact[]
  getContactById: (id: string) => AccountingContact | undefined
  clearData: () => void
}

export const useAccountingContactStore = create<AccountingContactState>()(
  persist(
    (set, get) => ({
      contacts: createSampleContacts(),

      addContact: (contact) =>
        set((state) => ({
          contacts: [...state.contacts, { ...contact, id: generateId(), createdAt: new Date().toISOString() }],
        })),

      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      getCustomers: () => get().contacts.filter((c) => c.type === 'customer' || c.type === 'both'),

      getVendors: () => get().contacts.filter((c) => c.type === 'vendor' || c.type === 'both'),

      getContactById: (id) => get().contacts.find((c) => c.id === id),

      clearData: () => set({ contacts: [] }),
    }),
    { name: 'signof-accounting-contacts-storage' }
  )
)
