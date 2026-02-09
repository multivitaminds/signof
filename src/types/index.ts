// ─── Status Enums (const object pattern) ───────────────────────────

export const DocumentStatus = {
  Draft: 'draft',
  Pending: 'pending',
  Sent: 'sent',
  Delivered: 'delivered',
  Viewed: 'viewed',
  Signed: 'signed',
  Completed: 'completed',
  Declined: 'declined',
  Voided: 'voided',
} as const

export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus]

export const SignerStatus = {
  Pending: 'pending',
  Signed: 'signed',
  Declined: 'declined',
} as const

export type SignerStatus = (typeof SignerStatus)[keyof typeof SignerStatus]

// ─── Core Interfaces ────────────────────────────────────────────────

export interface Signer {
  id: string
  name: string
  email: string
  status: SignerStatus
  signedAt: string | null
  order: number
}

export interface SignatureData {
  dataUrl: string
  timestamp: string
  signerId: string
}

export interface AuditEntry {
  action: string
  timestamp: string
  userId: string
  ip?: string
  detail?: string
}

export interface Document {
  id: string
  name: string
  status: DocumentStatus
  createdAt: string
  updatedAt: string
  fileUrl: string
  fileType: string
  signers: Signer[]
  signatures: SignatureData[]
  audit: AuditEntry[]
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Status groups for filtering */
export const ACTIVE_STATUSES: DocumentStatus[] = [
  DocumentStatus.Pending,
  DocumentStatus.Sent,
  DocumentStatus.Delivered,
  DocumentStatus.Viewed,
]

export const TERMINAL_STATUSES: DocumentStatus[] = [
  DocumentStatus.Completed,
  DocumentStatus.Declined,
  DocumentStatus.Voided,
]

/** Human-readable status labels */
export const STATUS_LABELS: Record<DocumentStatus, string> = {
  [DocumentStatus.Draft]: 'Draft',
  [DocumentStatus.Pending]: 'Pending',
  [DocumentStatus.Sent]: 'Sent',
  [DocumentStatus.Delivered]: 'Delivered',
  [DocumentStatus.Viewed]: 'Viewed',
  [DocumentStatus.Signed]: 'Signed',
  [DocumentStatus.Completed]: 'Completed',
  [DocumentStatus.Declined]: 'Declined',
  [DocumentStatus.Voided]: 'Voided',
}
