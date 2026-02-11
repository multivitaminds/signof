// ─── Theme Type ────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system'

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

// ─── Signing Order (const object pattern) ───────────────────────────

export const SigningOrder = {
  Sequential: 'sequential',
  Parallel: 'parallel',
} as const

export type SigningOrder = (typeof SigningOrder)[keyof typeof SigningOrder]

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

// ─── Pricing Table Types ─────────────────────────────────────────────

export interface PricingItem {
  id: string
  item: string
  description: string
  quantity: number
  unitPrice: number
}

export interface PricingTableData {
  items: PricingItem[]
  taxRate: number
  currency: string
}

// ─── Document Note Types ─────────────────────────────────────────────

export interface DocumentNote {
  id: string
  authorName: string
  content: string
  createdAt: string
}

// ─── Document Interface ──────────────────────────────────────────────

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
  fields: DocumentField[]
  folderId: string | null
  templateId: string | null
  expiresAt: string | null
  reminderSentAt: string | null
  signingOrder: SigningOrder
  pricingTable: PricingTableData | null
  notes: DocumentNote[]
}

// ─── Field Types (Document Placement) ───────────────────────────────

export const FieldType = {
  Signature: 'signature',
  Initial: 'initial',
  DateSigned: 'date_signed',
  Text: 'text',
  Checkbox: 'checkbox',
  Dropdown: 'dropdown',
  Attachment: 'attachment',
} as const

export type FieldType = (typeof FieldType)[keyof typeof FieldType]

export interface DocumentField {
  id: string
  type: FieldType
  recipientId: string
  page: number
  x: number
  y: number
  width: number
  height: number
  required: boolean
  label?: string
  placeholder?: string
  options?: string[]
  value?: string
}

// ─── Template Types ─────────────────────────────────────────────────

export interface RecipientRole {
  id: string
  label: string
  order: number
}

export interface Template {
  id: string
  name: string
  description: string
  documentName: string
  fields: DocumentField[]
  recipientRoles: RecipientRole[]
  createdAt: string
  updatedAt: string
}

// ─── Contact Types ──────────────────────────────────────────────────

export interface ContactSigningHistory {
  documentId: string
  date: string
  status: string
}

export interface Contact {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  signingHistory: ContactSigningHistory[]
  createdAt: string
}

// ─── Folder Types ───────────────────────────────────────────────────

export interface Folder {
  id: string
  name: string
  parentId: string | null
  color?: string
}

// ─── App Shell Types ────────────────────────────────────────────────

export interface BreadcrumbSegment {
  label: string
  path: string
}

export interface RecentItem {
  path: string
  label: string
  timestamp: number
}

export interface FavoriteItem {
  id: string
  path: string
  label: string
  icon: string
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

/** Ordered signing flow for progress display */
export const SIGNING_FLOW_STATUSES: DocumentStatus[] = [
  DocumentStatus.Draft,
  DocumentStatus.Sent,
  DocumentStatus.Delivered,
  DocumentStatus.Viewed,
  DocumentStatus.Signed,
  DocumentStatus.Completed,
]

/** Human-readable labels for audit actions */
export const ACTION_LABELS: Record<string, string> = {
  created: 'Document Created',
  sent: 'Document Sent',
  delivered: 'Document Delivered',
  viewed: 'Document Viewed',
  signed: 'Document Signed',
  completed: 'All Signatures Complete',
  declined: 'Signature Declined',
  voided: 'Document Voided',
}
