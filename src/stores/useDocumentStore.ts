import { create } from 'zustand'
import {
  type Document,
  type Signer,
  ACTIVE_STATUSES,
  DocumentStatus,
  SignerStatus,
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
      { id: 's1', name: 'Jane Smith', email: 'jane@example.com', status: SignerStatus.Pending, signedAt: null, order: 1 },
      { id: 's2', name: 'HR Director', email: 'hr@example.com', status: SignerStatus.Signed, signedAt: '2026-02-02T14:00:00Z', order: 2 },
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
      { id: 's3', name: 'Alice Johnson', email: 'alice@example.com', status: SignerStatus.Signed, signedAt: '2026-01-21T11:00:00Z', order: 1 },
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
        const allSigned = updatedSigners.every(
          (s) => s.status === SignerStatus.Signed
        )
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
        const signer = doc.signers.find((s) => s.id === signerId)
        const updatedSigners = doc.signers.map((s) =>
          s.id === signerId ? { ...s, status: SignerStatus.Signed as typeof s.status, signedAt: timestamp } : s
        )
        const allSigned = updatedSigners.every(
          (s) => s.status === SignerStatus.Signed
        )
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
