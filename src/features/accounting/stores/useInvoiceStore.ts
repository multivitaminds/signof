import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Invoice, AccInvoiceStatus } from '../types'
import { PaymentTerms } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function formatInvoiceNumber(num: number): string {
  return `INV-${String(num).padStart(4, '0')}`
}

function createSampleInvoices(): Invoice[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'inv-sample-1', invoiceNumber: 'INV-0001', customerId: 'contact-acme', customerName: 'Acme Corp',
      issueDate: '2026-02-01', dueDate: '2026-03-03', paymentTerms: PaymentTerms.Net30,
      status: 'draft',
      lineItems: [
        { id: generateId(), description: 'Web Development Services', quantity: 40, rate: 30, amount: 1200 },
      ],
      subtotal: 1200, taxRate: 0, taxAmount: 0, discount: 0, total: 1200, amountPaid: 0, balance: 1200,
      notes: 'Thank you for your business!', createdAt: now,
    },
    {
      id: 'inv-sample-2', invoiceNumber: 'INV-0002', customerId: 'contact-acme', customerName: 'Acme Corp',
      issueDate: '2026-01-15', dueDate: '2026-02-14', paymentTerms: PaymentTerms.Net30,
      status: 'sent',
      lineItems: [
        { id: generateId(), description: 'UI/UX Design', quantity: 30, rate: 75, amount: 2250 },
        { id: generateId(), description: 'Brand Strategy Consultation', quantity: 8, rate: 150, amount: 1200 },
      ],
      subtotal: 3450, taxRate: 0, taxAmount: 0, discount: 0, total: 3450, amountPaid: 0, balance: 3450,
      notes: '', createdAt: now,
    },
    {
      id: 'inv-sample-3', invoiceNumber: 'INV-0003', customerId: 'contact-globex', customerName: 'Globex Inc',
      issueDate: '2026-01-10', dueDate: '2026-02-09', paymentTerms: PaymentTerms.Net30,
      status: 'partially_paid',
      lineItems: [
        { id: generateId(), description: 'Consulting Services - Phase 1', quantity: 1, rate: 5000, amount: 5000 },
      ],
      subtotal: 5000, taxRate: 0, taxAmount: 0, discount: 0, total: 5000, amountPaid: 2000, balance: 3000,
      notes: 'Phase 1 of 3', createdAt: now,
    },
    {
      id: 'inv-sample-4', invoiceNumber: 'INV-0004', customerId: 'contact-initech', customerName: 'Initech',
      issueDate: '2026-01-05', dueDate: '2026-01-20', paymentTerms: PaymentTerms.Net15,
      status: 'paid',
      lineItems: [
        { id: generateId(), description: 'Software Licenses', quantity: 10, rate: 200, amount: 2000 },
        { id: generateId(), description: 'Implementation Support', quantity: 8, rate: 100, amount: 800 },
      ],
      subtotal: 2800, taxRate: 0, taxAmount: 0, discount: 0, total: 2800, amountPaid: 2800, balance: 0,
      notes: 'Paid in full', createdAt: now,
    },
    {
      id: 'inv-sample-5', invoiceNumber: 'INV-0005', customerId: 'contact-umbrella', customerName: 'Umbrella Corp',
      issueDate: '2025-12-15', dueDate: '2026-01-14', paymentTerms: PaymentTerms.Net30,
      status: 'overdue',
      lineItems: [
        { id: generateId(), description: 'Security Audit', quantity: 1, rate: 1750, amount: 1750 },
      ],
      subtotal: 1750, taxRate: 0, taxAmount: 0, discount: 0, total: 1750, amountPaid: 0, balance: 1750,
      notes: 'Payment overdue', createdAt: now,
    },
  ]
}

interface InvoiceState {
  invoices: Invoice[]
  nextInvoiceNumber: number

  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => Invoice
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  sendInvoice: (id: string) => void
  recordPayment: (id: string, amount: number) => void
  voidInvoice: (id: string) => void
  markOverdue: (id: string) => void
  getInvoicesByStatus: (status: AccInvoiceStatus) => Invoice[]
  getOutstandingTotal: () => number
  getOverdueTotal: () => number
  clearData: () => void
  importInvoices: (items: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>[]) => void
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: createSampleInvoices(),
      nextInvoiceNumber: 6,

      addInvoice: (invoice) => {
        const num = get().nextInvoiceNumber
        const newInvoice: Invoice = {
          ...invoice,
          id: generateId(),
          invoiceNumber: formatInvoiceNumber(num),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          invoices: [...state.invoices, newInvoice],
          nextInvoiceNumber: state.nextInvoiceNumber + 1,
        }))
        return newInvoice
      },

      updateInvoice: (id, updates) =>
        set((state) => ({
          invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
        })),

      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),

      sendInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, status: 'sent' as const } : inv
          ),
        })),

      recordPayment: (id, amount) =>
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv
            const newAmountPaid = inv.amountPaid + amount
            const newBalance = inv.total - newAmountPaid
            const newStatus: AccInvoiceStatus = newBalance <= 0 ? 'paid' : 'partially_paid'
            return { ...inv, amountPaid: newAmountPaid, balance: Math.max(0, newBalance), status: newStatus }
          }),
        })),

      voidInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, status: 'void' as const } : inv
          ),
        })),

      markOverdue: (id) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, status: 'overdue' as const } : inv
          ),
        })),

      getInvoicesByStatus: (status) => get().invoices.filter((inv) => inv.status === status),

      getOutstandingTotal: () =>
        get()
          .invoices.filter((inv) => inv.status !== 'paid' && inv.status !== 'void' && inv.status !== 'draft')
          .reduce((sum, inv) => sum + inv.balance, 0),

      getOverdueTotal: () =>
        get()
          .invoices.filter((inv) => inv.status === 'overdue')
          .reduce((sum, inv) => sum + inv.balance, 0),

      clearData: () =>
        set({
          invoices: [],
          nextInvoiceNumber: 1,
        }),

      importInvoices: (items) => {
        const startNum = get().nextInvoiceNumber
        const newInvoices = items.map((item, i) => ({
          ...item,
          id: generateId(),
          invoiceNumber: formatInvoiceNumber(startNum + i),
          createdAt: new Date().toISOString(),
        }))
        set((state) => ({
          invoices: [...state.invoices, ...newInvoices],
          nextInvoiceNumber: state.nextInvoiceNumber + items.length,
        }))
      },
    }),
    { name: 'origina-invoice-storage' }
  )
)
