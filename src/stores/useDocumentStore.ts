import { create } from 'zustand'
import {
  type Document,
  type Signer,
  type DocumentField,
  type PricingTableData,
  type DocumentNote,
  ACTIVE_STATUSES,
  DocumentStatus,
  SignerStatus,
  SigningOrder,
  SignerRole,
} from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Employment Agreement - Jane Smith',
    status: DocumentStatus.Pending,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-02T14:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's1', name: 'Jane Smith', email: 'jane@example.com', status: SignerStatus.Pending, signedAt: null, order: 1, role: SignerRole.Signer },
      { id: 's2', name: 'HR Director', email: 'hr@example.com', status: SignerStatus.Signed, signedAt: '2026-02-02T14:00:00Z', order: 2, role: SignerRole.Signer },
    ],
    signatures: [],
    audit: [
      { action: 'created', timestamp: '2026-02-01T10:00:00Z', userId: 'system' },
      { action: 'signed', timestamp: '2026-02-02T14:00:00Z', userId: 's2', detail: 'HR Director signed' },
    ],
    fields: [],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
  },
  {
    id: '2',
    name: 'NDA - Project Phoenix',
    status: DocumentStatus.Completed,
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-21T11:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's3', name: 'Alice Johnson', email: 'alice@example.com', status: SignerStatus.Signed, signedAt: '2026-01-21T11:00:00Z', order: 1, role: SignerRole.Signer },
    ],
    signatures: [],
    audit: [
      { action: 'created', timestamp: '2026-01-20T09:00:00Z', userId: 'system' },
      { action: 'completed', timestamp: '2026-01-21T11:00:00Z', userId: 'system' },
    ],
    fields: [],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
  },
  {
    id: '3',
    name: 'Contractor Invoice #1042',
    status: DocumentStatus.Draft,
    createdAt: '2026-02-07T16:30:00Z',
    updatedAt: '2026-02-07T16:30:00Z',
    fileUrl: '',
    fileType: 'image/png',
    signers: [],
    signatures: [],
    audit: [
      { action: 'created', timestamp: '2026-02-07T16:30:00Z', userId: 'system' },
    ],
    fields: [],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
  },
]

interface DocumentState {
  documents: Document[]

  // Actions
  addDocument: (file: File) => Document
  deleteDocument: (docId: string) => void
  signDocument: (docId: string, dataUrl: string) => void
  signAsSigner: (docId: string, signerId: string, dataUrl: string) => void
  sendDocument: (docId: string) => void
  addSigner: (docId: string, name: string, email: string) => void
  removeSigner: (docId: string, signerId: string) => void
  getDocument: (docId: string) => Document | undefined

  // Signing Order
  setSigningOrder: (docId: string, order: SigningOrder) => void
  getActiveSignerId: (docId: string) => string | null
  canSignerSign: (docId: string, signerId: string) => boolean

  // Pricing Table
  updatePricingTable: (docId: string, data: PricingTableData) => void

  // Document Expiration
  setDocumentExpiration: (docId: string, date: string | null) => void
  getExpiredDocuments: () => Document[]
  autoExpireDocuments: () => void

  // Bulk Send
  bulkCreateDocuments: (templateDoc: Document, recipients: { name: string; email: string }[]) => Document[]

  // Document Notes
  addDocumentNote: (docId: string, content: string, authorName?: string) => void
  deleteDocumentNote: (docId: string, noteId: string) => void

  // Document Builder
  createDocumentFromBuilder: (params: {
    file: File
    signers: { name: string; email: string; role?: SignerRole }[]
    fields: DocumentField[]
    signingOrder: SigningOrder
    message?: string
    pricingTable?: PricingTableData | null
    expiresAt?: string | null
  }) => Document

  // Decline
  declineDocument: (docId: string, signerId: string, reason: string) => void

  // Computed
  totalCount: number
  inProgressCount: number
  completedCount: number
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: SAMPLE_DOCUMENTS,

  addDocument: (file: File) => {
    const timestamp = now()
    const newDoc: Document = {
      id: generateId(),
      name: file.name,
      status: DocumentStatus.Draft,
      createdAt: timestamp,
      updatedAt: timestamp,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      signers: [],
      signatures: [],
      audit: [{ action: 'created', timestamp, userId: 'you' }],
      fields: [],
      folderId: null,
      templateId: null,
      expiresAt: null,
      reminderSentAt: null,
      signingOrder: SigningOrder.Parallel,
      pricingTable: null,
      notes: [],
    }
    set((state) => ({ documents: [newDoc, ...state.documents] }))
    return newDoc
  },

  deleteDocument: (docId: string) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== docId),
    }))
  },

  signDocument: (docId: string, dataUrl: string) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        const updatedSigners: Signer[] = doc.signers.map((s) =>
          s.status === SignerStatus.Pending
            ? { ...s, status: SignerStatus.Signed, signedAt: timestamp }
            : s
        )
        const allSigned = updatedSigners
          .filter((s) => s.role === SignerRole.Signer)
          .every((s) => s.status === SignerStatus.Signed)
        return {
          ...doc,
          signers: updatedSigners,
          status: allSigned ? DocumentStatus.Completed : doc.status,
          updatedAt: timestamp,
          signatures: [
            ...doc.signatures,
            { dataUrl, timestamp, signerId: updatedSigners[0]?.id ?? '' },
          ],
          audit: [
            ...doc.audit,
            { action: 'signed', timestamp, userId: updatedSigners[0]?.id ?? '' },
            ...(allSigned
              ? [{ action: 'completed', timestamp, userId: 'system' }]
              : []),
          ],
        }
      }),
    }))
  },

  signAsSigner: (docId: string, signerId: string, dataUrl: string) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc

        // Enforce sequential signing order
        if (doc.signingOrder === SigningOrder.Sequential) {
          const sortedPending = [...doc.signers]
            .filter((s) => s.status === SignerStatus.Pending)
            .sort((a, b) => a.order - b.order)
          const nextSigner = sortedPending[0]
          if (nextSigner && nextSigner.id !== signerId) {
            return doc // Cannot sign out of order
          }
        }

        const signer = doc.signers.find((s) => s.id === signerId)
        const updatedSigners = doc.signers.map((s) =>
          s.id === signerId ? { ...s, status: SignerStatus.Signed as typeof s.status, signedAt: timestamp } : s
        )
        const allSigned = updatedSigners
          .filter((s) => s.role === SignerRole.Signer)
          .every((s) => s.status === SignerStatus.Signed)
        return {
          ...doc,
          signers: updatedSigners,
          status: allSigned ? DocumentStatus.Completed : DocumentStatus.Signed,
          updatedAt: timestamp,
          signatures: [
            ...doc.signatures,
            { dataUrl, timestamp, signerId },
          ],
          audit: [
            ...doc.audit,
            { action: 'signed', timestamp, userId: signerId, detail: `Signed by ${signer?.name ?? 'Unknown'}` },
            ...(allSigned
              ? [{ action: 'completed', timestamp, userId: 'system', detail: 'All signers have signed' }]
              : []),
          ],
        }
      }),
    }))
  },

  sendDocument: (docId: string) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        return {
          ...doc,
          status: DocumentStatus.Sent,
          updatedAt: timestamp,
          audit: [
            ...doc.audit,
            { action: 'sent', timestamp, userId: 'you', detail: `Sent to ${doc.signers.length} signers` },
          ],
        }
      }),
    }))
    // Simulate delivery after 2s
    setTimeout(() => {
      const ts = now()
      set((state) => ({
        documents: state.documents.map((doc) => {
          if (doc.id !== docId || doc.status !== DocumentStatus.Sent) return doc
          return {
            ...doc,
            status: DocumentStatus.Delivered,
            updatedAt: ts,
            audit: [
              ...doc.audit,
              { action: 'delivered', timestamp: ts, userId: 'system', detail: 'Delivered to all recipients' },
            ],
          }
        }),
      }))
    }, 2000)
    // Simulate viewed after 5s (2 + 3)
    setTimeout(() => {
      const ts = now()
      set((state) => ({
        documents: state.documents.map((doc) => {
          if (doc.id !== docId || doc.status !== DocumentStatus.Delivered) return doc
          return {
            ...doc,
            status: DocumentStatus.Viewed,
            updatedAt: ts,
            audit: [
              ...doc.audit,
              { action: 'viewed', timestamp: ts, userId: 'system', detail: 'Viewed by recipients' },
            ],
          }
        }),
      }))
    }, 5000)
  },

  addSigner: (docId: string, name: string, email: string) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        const maxOrder = doc.signers.reduce((max, s) => Math.max(max, s.order), 0)
        const newSigner: Signer = {
          id: generateId(),
          name,
          email,
          status: SignerStatus.Pending,
          signedAt: null,
          order: maxOrder + 1,
          role: SignerRole.Signer,
        }
        return {
          ...doc,
          signers: [...doc.signers, newSigner],
          updatedAt: timestamp,
        }
      }),
    }))
  },

  removeSigner: (docId: string, signerId: string) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        return {
          ...doc,
          signers: doc.signers.filter((s) => s.id !== signerId),
          updatedAt: timestamp,
        }
      }),
    }))
  },

  getDocument: (docId: string) => {
    return get().documents.find((d) => d.id === docId)
  },

  // ─── Signing Order ─────────────────────────────────────────────────

  setSigningOrder: (docId: string, order: SigningOrder) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        return { ...doc, signingOrder: order, updatedAt: timestamp }
      }),
    }))
  },

  getActiveSignerId: (docId: string) => {
    const doc = get().documents.find((d) => d.id === docId)
    if (!doc) return null
    if (doc.signingOrder === SigningOrder.Parallel) return null

    const sortedPending = [...doc.signers]
      .filter((s) => s.status === SignerStatus.Pending && s.role === SignerRole.Signer)
      .sort((a, b) => a.order - b.order)
    return sortedPending[0]?.id ?? null
  },

  canSignerSign: (docId: string, signerId: string) => {
    const doc = get().documents.find((d) => d.id === docId)
    if (!doc) return false

    const signer = doc.signers.find((s) => s.id === signerId)
    if (!signer || signer.status !== SignerStatus.Pending) return false


    // CC and Viewer roles cannot sign
    if (signer.role === SignerRole.CC || signer.role === SignerRole.Viewer) return false
    if (doc.signingOrder === SigningOrder.Parallel) return true

    // Sequential: only the lowest-order pending signer (with signer role) can sign
    const sortedPending = [...doc.signers]
      .filter((s) => s.status === SignerStatus.Pending && s.role === SignerRole.Signer)
      .sort((a, b) => a.order - b.order)
    return sortedPending[0]?.id === signerId
  },

  // ─── Pricing Table ─────────────────────────────────────────────────

  updatePricingTable: (docId: string, data: PricingTableData) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        return { ...doc, pricingTable: data, updatedAt: timestamp }
      }),
    }))
  },

  // ─── Document Expiration ───────────────────────────────────────────

  setDocumentExpiration: (docId: string, date: string | null) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        return { ...doc, expiresAt: date, updatedAt: timestamp }
      }),
    }))
  },

  getExpiredDocuments: () => {
    const currentTime = new Date().toISOString()
    return get().documents.filter(
      (doc) =>
        doc.expiresAt !== null &&
        doc.expiresAt < currentTime &&
        doc.status !== DocumentStatus.Voided &&
        doc.status !== DocumentStatus.Completed
    )
  },

  autoExpireDocuments: () => {
    const currentTime = new Date().toISOString()
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (
          doc.expiresAt !== null &&
          doc.expiresAt < currentTime &&
          doc.status !== DocumentStatus.Voided &&
          doc.status !== DocumentStatus.Completed
        ) {
          return {
            ...doc,
            status: DocumentStatus.Voided,
            updatedAt: timestamp,
            audit: [
              ...doc.audit,
              { action: 'voided', timestamp, userId: 'system', detail: 'Document expired' },
            ],
          }
        }
        return doc
      }),
    }))
  },

  // ─── Bulk Send ─────────────────────────────────────────────────────

  bulkCreateDocuments: (templateDoc: Document, recipients: { name: string; email: string }[]) => {
    const timestamp = now()
    const newDocs: Document[] = recipients.map((recipient) => ({
      id: generateId(),
      name: templateDoc.name,
      status: DocumentStatus.Sent,
      createdAt: timestamp,
      updatedAt: timestamp,
      fileUrl: templateDoc.fileUrl,
      fileType: templateDoc.fileType,
      signers: [
        {
          id: generateId(),
          name: recipient.name,
          email: recipient.email,
          status: SignerStatus.Pending,
          signedAt: null,
          order: 1,
          role: SignerRole.Signer,
        },
      ],
      signatures: [],
      audit: [
        { action: 'created', timestamp, userId: 'you', detail: 'Created via bulk send' },
        { action: 'sent', timestamp, userId: 'you', detail: `Sent to ${recipient.name}` },
      ],
      fields: [...templateDoc.fields],
      folderId: templateDoc.folderId,
      templateId: templateDoc.templateId ?? templateDoc.id,
      expiresAt: templateDoc.expiresAt,
      reminderSentAt: null,
      signingOrder: SigningOrder.Parallel,
      pricingTable: templateDoc.pricingTable ? { ...templateDoc.pricingTable, items: templateDoc.pricingTable.items.map((i) => ({ ...i })) } : null,
      notes: [],
    }))

    set((state) => ({ documents: [...newDocs, ...state.documents] }))
    return newDocs
  },

  // ─── Document Notes ────────────────────────────────────────────────

  addDocumentNote: (docId: string, content: string, authorName = 'You') => {
    const timestamp = now()
    const note: DocumentNote = {
      id: generateId(),
      authorName,
      content,
      createdAt: timestamp,
    }
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        return {
          ...doc,
          notes: [...doc.notes, note],
          updatedAt: timestamp,
        }
      }),
    }))
  },

  deleteDocumentNote: (docId: string, noteId: string) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        return {
          ...doc,
          notes: doc.notes.filter((n) => n.id !== noteId),
          updatedAt: timestamp,
        }
      }),
    }))
  },

  // ─── Document Builder ────────────────────────────────────────────────

  createDocumentFromBuilder: (params) => {
    const timestamp = now()
    const signers: Signer[] = params.signers.map((s, i) => ({
      id: generateId(),
      name: s.name,
      email: s.email,
      status: SignerStatus.Pending,
      signedAt: null,
      order: i + 1,
      role: s.role ?? SignerRole.Signer,
    }))

    // Re-map field recipientIds from temporary indices to generated signer IDs
    const fields: DocumentField[] = params.fields.map((f) => {
      // Find if field.recipientId is a temp index like "signer-0", "signer-1"
      const match = f.recipientId.match(/^signer-(\d+)$/)
      if (match && match[1] !== undefined) {
        const idx = parseInt(match[1], 10)
        const signer = signers[idx]
        if (signer) {
          return { ...f, recipientId: signer.id }
        }
      }
      // If recipientId is 'default' or already an id, assign to first signer
      const firstSigner = signers[0]
      if (firstSigner && (f.recipientId === 'default' || !signers.find(s => s.id === f.recipientId))) {
        return { ...f, recipientId: firstSigner.id }
      }
      return f
    })

    const newDoc: Document = {
      id: generateId(),
      name: params.file.name,
      status: DocumentStatus.Sent,
      createdAt: timestamp,
      updatedAt: timestamp,
      fileUrl: URL.createObjectURL(params.file),
      fileType: params.file.type,
      signers,
      signatures: [],
      audit: [
        { action: 'created', timestamp, userId: 'you' },
        { action: 'sent', timestamp, userId: 'you', detail: params.message ?? `Sent to ${signers.length} signers` },
      ],
      fields,
      folderId: null,
      templateId: null,
      expiresAt: params.expiresAt ?? null,
      reminderSentAt: null,
      signingOrder: params.signingOrder,
      pricingTable: params.pricingTable ?? null,
      notes: [],
    }

    set((state) => ({ documents: [newDoc, ...state.documents] }))
    return newDoc
  },

  // ─── Decline Document ───────────────────────────────────────────────

  declineDocument: (docId: string, signerId: string, reason: string) => {
    const timestamp = now()
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc
        const signer = doc.signers.find((s) => s.id === signerId)
        return {
          ...doc,
          status: DocumentStatus.Declined,
          updatedAt: timestamp,
          signers: doc.signers.map((s) =>
            s.id === signerId
              ? { ...s, status: SignerStatus.Declined as typeof s.status, signedAt: timestamp }
              : s
          ),
          audit: [
            ...doc.audit,
            {
              action: 'declined',
              timestamp,
              userId: signerId,
              detail: `Declined by ${signer?.name ?? 'Unknown'}: ${reason}`,
            },
          ],
        }
      }),
    }))
  },

  get totalCount() {
    return get().documents.length
  },

  get inProgressCount() {
    return get().documents.filter((d) =>
      (ACTIVE_STATUSES as string[]).includes(d.status)
    ).length
  },

  get completedCount() {
    return get().documents.filter((d) => d.status === DocumentStatus.Completed)
      .length
  },
}))
