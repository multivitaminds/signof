import { create } from 'zustand'
import {
  type Document,
  type Signer,
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
  },
]

interface DocumentState {
  documents: Document[]
  
  // Actions
  addDocument: (file: File) => Document
  deleteDocument: (docId: string) => void
  signDocument: (docId: string, dataUrl: string) => void
  getDocument: (docId: string) => Document | undefined
  
  // Computed
  totalCount: number
  pendingCount: number
  completedCount: number
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: SAMPLE_DOCUMENTS,

  addDocument: (file: File) => {
    const timestamp = now()
    const newDoc: Document = {
      id: generateId(),
      name: file.name,
      status: DocumentStatus.Pending,
      createdAt: timestamp,
      updatedAt: timestamp,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      signers: [
        {
          id: generateId(),
          name: 'You',
          email: 'you@example.com',
          status: SignerStatus.Pending,
          signedAt: null,
          order: 1,
        },
      ],
      signatures: [],
      audit: [{ action: 'created', timestamp, userId: 'you' }],
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

  getDocument: (docId: string) => {
    return get().documents.find((d) => d.id === docId)
  },

  get totalCount() {
    return get().documents.length
  },

  get pendingCount() {
    return get().documents.filter((d) => d.status === DocumentStatus.Pending)
      .length
  },

  get completedCount() {
    return get().documents.filter((d) => d.status === DocumentStatus.Completed)
      .length
  },
}))
