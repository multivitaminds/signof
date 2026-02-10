import { useState, useMemo, useCallback } from 'react'
import {
  X,
  Plus,
  Minus,
  RefreshCw,
  ChevronDown,
  GitCompare,
} from 'lucide-react'
import type { Document, DocumentField } from '../../../../types'
import { useDocumentStore } from '../../../../stores/useDocumentStore'
import './DocumentComparison.css'

// ─── Props ──────────────────────────────────────────────────────────

interface DocumentComparisonProps {
  documentId: string
  onClose: () => void
}

// ─── Types ──────────────────────────────────────────────────────────

type ChangeType = 'added' | 'removed' | 'modified'

interface FieldChange {
  type: ChangeType
  field: DocumentField
  oldField?: DocumentField
}

interface VersionSnapshot {
  id: string
  label: string
  timestamp: string
  fields: DocumentField[]
  status: string
  signerCount: number
}

// ─── Helpers ────────────────────────────────────────────────────────

function generateVersionSnapshots(doc: Document): VersionSnapshot[] {
  // Generate mock version snapshots from audit trail
  // In a real app, these would be persisted versions
  const snapshots: VersionSnapshot[] = []

  // Version 1: Initial creation
  const createdEntry = doc.audit.find((e) => e.action === 'created')
  if (createdEntry) {
    snapshots.push({
      id: 'v1',
      label: 'v1 - Initial',
      timestamp: createdEntry.timestamp,
      fields: [],
      status: 'draft',
      signerCount: 0,
    })
  }

  // Version 2: Current state (with fields)
  if (doc.fields.length > 0) {
    // Version with some fields
    const halfFields = doc.fields.slice(0, Math.ceil(doc.fields.length / 2))
    const sentEntry = doc.audit.find((e) => e.action === 'sent')
    snapshots.push({
      id: 'v2',
      label: 'v2 - Fields Added',
      timestamp: sentEntry?.timestamp ?? doc.updatedAt,
      fields: halfFields,
      status: 'pending',
      signerCount: Math.max(doc.signers.length - 1, 0),
    })
  }

  // Latest version: Current state
  snapshots.push({
    id: `v${snapshots.length + 1}`,
    label: `v${snapshots.length + 1} - Current`,
    timestamp: doc.updatedAt,
    fields: doc.fields,
    status: doc.status,
    signerCount: doc.signers.length,
  })

  return snapshots
}

function computeFieldChanges(
  leftFields: DocumentField[],
  rightFields: DocumentField[]
): FieldChange[] {
  const changes: FieldChange[] = []
  const leftMap = new Map(leftFields.map((f) => [f.id, f]))
  const rightMap = new Map(rightFields.map((f) => [f.id, f]))

  // Fields in right but not in left = added
  for (const field of rightFields) {
    if (!leftMap.has(field.id)) {
      changes.push({ type: 'added', field })
    }
  }

  // Fields in left but not in right = removed
  for (const field of leftFields) {
    if (!rightMap.has(field.id)) {
      changes.push({ type: 'removed', field })
    }
  }

  // Fields in both but changed = modified
  for (const field of rightFields) {
    const leftField = leftMap.get(field.id)
    if (!leftField) continue
    const changed =
      leftField.type !== field.type ||
      leftField.x !== field.x ||
      leftField.y !== field.y ||
      leftField.width !== field.width ||
      leftField.height !== field.height ||
      leftField.required !== field.required ||
      leftField.label !== field.label ||
      leftField.value !== field.value
    if (changed) {
      changes.push({ type: 'modified', field, oldField: leftField })
    }
  }

  return changes
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Component ──────────────────────────────────────────────────────

function DocumentComparison({ documentId, onClose }: DocumentComparisonProps) {
  const doc = useDocumentStore((s) => s.documents.find((d) => d.id === documentId))

  const versions = useMemo(() => {
    if (!doc) return []
    return generateVersionSnapshots(doc)
  }, [doc])

  const [leftVersionId, setLeftVersionId] = useState(() =>
    versions.length >= 2 ? (versions[0]?.id ?? '') : ''
  )
  const [rightVersionId, setRightVersionId] = useState(() =>
    versions.length >= 1 ? (versions[versions.length - 1]?.id ?? '') : ''
  )

  const leftVersion = versions.find((v) => v.id === leftVersionId) ?? null
  const rightVersion = versions.find((v) => v.id === rightVersionId) ?? null

  const changes = useMemo(() => {
    if (!leftVersion || !rightVersion) return []
    return computeFieldChanges(leftVersion.fields, rightVersion.fields)
  }, [leftVersion, rightVersion])

  const addedCount = changes.filter((c) => c.type === 'added').length
  const removedCount = changes.filter((c) => c.type === 'removed').length
  const modifiedCount = changes.filter((c) => c.type === 'modified').length

  const handleSwap = useCallback(() => {
    setLeftVersionId(rightVersionId)
    setRightVersionId(leftVersionId)
  }, [leftVersionId, rightVersionId])

  if (!doc) {
    return (
      <div className="document-comparison">
        <div className="document-comparison__empty">
          <p>Document not found.</p>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="document-comparison">
      {/* Header */}
      <div className="document-comparison__header">
        <div className="document-comparison__header-left">
          <GitCompare size={20} />
          <h2 className="document-comparison__title">Compare Versions</h2>
        </div>
        <button
          type="button"
          className="document-comparison__close-btn"
          onClick={onClose}
          aria-label="Close comparison"
        >
          <X size={18} />
        </button>
      </div>

      {/* Summary stats */}
      <div className="document-comparison__summary" role="status">
        <span className="document-comparison__summary-item document-comparison__summary-item--added">
          <Plus size={14} />
          {addedCount} field{addedCount !== 1 ? 's' : ''} added
        </span>
        <span className="document-comparison__summary-item document-comparison__summary-item--modified">
          <RefreshCw size={14} />
          {modifiedCount} field{modifiedCount !== 1 ? 's' : ''} modified
        </span>
        <span className="document-comparison__summary-item document-comparison__summary-item--removed">
          <Minus size={14} />
          {removedCount} field{removedCount !== 1 ? 's' : ''} removed
        </span>
      </div>

      {/* Version selectors */}
      <div className="document-comparison__selectors">
        <div className="document-comparison__selector">
          <label className="document-comparison__selector-label">Left version</label>
          <div className="document-comparison__select-wrapper">
            <select
              className="document-comparison__select"
              value={leftVersionId}
              onChange={(e) => setLeftVersionId(e.target.value)}
              aria-label="Left version selector"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="document-comparison__select-icon" />
          </div>
        </div>

        <button
          type="button"
          className="document-comparison__swap-btn"
          onClick={handleSwap}
          aria-label="Swap versions"
        >
          <RefreshCw size={16} />
        </button>

        <div className="document-comparison__selector">
          <label className="document-comparison__selector-label">Right version</label>
          <div className="document-comparison__select-wrapper">
            <select
              className="document-comparison__select"
              value={rightVersionId}
              onChange={(e) => setRightVersionId(e.target.value)}
              aria-label="Right version selector"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="document-comparison__select-icon" />
          </div>
        </div>
      </div>

      {/* Side-by-side panels */}
      <div className="document-comparison__panels">
        {/* Left panel */}
        <div className="document-comparison__panel">
          <div className="document-comparison__panel-header">
            <span className="document-comparison__panel-title">
              {leftVersion?.label ?? 'Select version'}
            </span>
            {leftVersion && (
              <span className="document-comparison__panel-meta">
                {formatTimestamp(leftVersion.timestamp)}
              </span>
            )}
          </div>
          <div className="document-comparison__panel-body">
            {leftVersion && leftVersion.fields.length === 0 && (
              <div className="document-comparison__panel-empty">
                No fields in this version
              </div>
            )}
            {leftVersion?.fields.map((field) => {
              const change = changes.find(
                (c) => (c.type === 'removed' || c.type === 'modified') && c.field.id === field.id
              )
              const changeForModified = changes.find(
                (c) => c.type === 'modified' && c.oldField?.id === field.id
              )
              const highlight = change?.type === 'removed'
                ? 'removed'
                : changeForModified
                  ? 'modified'
                  : undefined
              return (
                <div
                  key={field.id}
                  className={`document-comparison__field${
                    highlight ? ` document-comparison__field--${highlight}` : ''
                  }`}
                >
                  <span className="document-comparison__field-type">{field.type}</span>
                  <span className="document-comparison__field-label">
                    {field.label ?? field.type}
                  </span>
                  <span className="document-comparison__field-pos">
                    ({field.x}, {field.y}) {field.width}x{field.height}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="document-comparison__panel">
          <div className="document-comparison__panel-header">
            <span className="document-comparison__panel-title">
              {rightVersion?.label ?? 'Select version'}
            </span>
            {rightVersion && (
              <span className="document-comparison__panel-meta">
                {formatTimestamp(rightVersion.timestamp)}
              </span>
            )}
          </div>
          <div className="document-comparison__panel-body">
            {rightVersion && rightVersion.fields.length === 0 && (
              <div className="document-comparison__panel-empty">
                No fields in this version
              </div>
            )}
            {rightVersion?.fields.map((field) => {
              const change = changes.find(
                (c) => (c.type === 'added' || c.type === 'modified') && c.field.id === field.id
              )
              return (
                <div
                  key={field.id}
                  className={`document-comparison__field${
                    change ? ` document-comparison__field--${change.type}` : ''
                  }`}
                >
                  <span className="document-comparison__field-type">{field.type}</span>
                  <span className="document-comparison__field-label">
                    {field.label ?? field.type}
                  </span>
                  <span className="document-comparison__field-pos">
                    ({field.x}, {field.y}) {field.width}x{field.height}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Changes detail list */}
      {changes.length > 0 && (
        <div className="document-comparison__changes">
          <h3 className="document-comparison__changes-title">
            Changes ({changes.length})
          </h3>
          <div className="document-comparison__changes-list">
            {changes.map((change, i) => (
              <div
                key={`${change.field.id}-${i}`}
                className={`document-comparison__change-item document-comparison__change-item--${change.type}`}
              >
                <span className="document-comparison__change-icon">
                  {change.type === 'added' && <Plus size={14} />}
                  {change.type === 'removed' && <Minus size={14} />}
                  {change.type === 'modified' && <RefreshCw size={14} />}
                </span>
                <span className="document-comparison__change-text">
                  <strong>{change.field.label ?? change.field.type}</strong>
                  {' '}
                  {change.type === 'added' && 'was added'}
                  {change.type === 'removed' && 'was removed'}
                  {change.type === 'modified' && 'was modified'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {changes.length === 0 && leftVersion && rightVersion && (
        <div className="document-comparison__no-changes">
          No differences between selected versions.
        </div>
      )}

      {/* Footer */}
      <div className="document-comparison__footer">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default DocumentComparison
