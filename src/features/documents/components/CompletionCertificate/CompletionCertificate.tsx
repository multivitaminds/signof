import { useCallback, useMemo, useState } from 'react'
import {
  Award,
  Download,
  Link2,
  Check,
  Clock,
  Mail,
  Eye,
  PenTool,
  FileCheck,
  Shield,
} from 'lucide-react'
import type { Document, AuditEntry } from '../../../../types'
import { ACTION_LABELS } from '../../../../types'
import './CompletionCertificate.css'

// ─── Props ──────────────────────────────────────────────────────────

interface CompletionCertificateProps {
  document: Document
  onClose: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function generateCertificateHash(doc: Document): string {
  // Deterministic hash based on document id, signers, and completion timestamp
  const completedEntry = [...doc.audit]
    .reverse()
    .find((entry) => entry.action === 'completed')
  const seed = `${doc.id}-${doc.signers.map((s) => s.id).join('-')}-${completedEntry?.timestamp ?? doc.updatedAt}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i)
    hash = ((hash << 5) - hash + ch) | 0
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()
  const idClean = doc.id.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4).padEnd(4, '0')
  return `ORCHESTREE-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${idClean}`
}

function getAuditIcon(action: string) {
  switch (action) {
    case 'created':
      return <FileCheck size={14} />
    case 'sent':
      return <Mail size={14} />
    case 'delivered':
      return <Mail size={14} />
    case 'viewed':
      return <Eye size={14} />
    case 'signed':
      return <PenTool size={14} />
    case 'completed':
      return <Check size={14} />
    default:
      return <Clock size={14} />
  }
}

// ─── Component ──────────────────────────────────────────────────────

function CompletionCertificate({ document: doc, onClose }: CompletionCertificateProps) {
  const [linkCopied, setLinkCopied] = useState(false)

  const completionDate = useMemo(() => {
    const completedEntry = [...doc.audit]
      .reverse()
      .find((entry) => entry.action === 'completed')
    return completedEntry ? completedEntry.timestamp : doc.updatedAt
  }, [doc.audit, doc.updatedAt])

  const certificateHash = useMemo(() => generateCertificateHash(doc), [doc])

  const getSignatureThumbnail = useCallback(
    (signerId: string): string | null => {
      const sig = doc.signatures.find((s) => s.signerId === signerId)
      return sig ? sig.dataUrl : null
    },
    [doc.signatures]
  )

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleCopyLink = useCallback(() => {
    const certificateUrl = `${window.location.origin}/documents/certificate/${doc.id}`
    navigator.clipboard.writeText(certificateUrl).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }).catch((err: unknown) => {
      console.error('Clipboard write failed, using fallback:', err)
      // Fallback: use a hidden input
      const input = window.document.createElement('input')
      input.value = certificateUrl
      window.document.body.appendChild(input)
      input.select()
      window.document.execCommand('copy')
      window.document.body.removeChild(input)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }, [doc.id])

  const auditEntries: AuditEntry[] = useMemo(
    () => [...doc.audit].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),
    [doc.audit]
  )

  return (
    <div className="completion-certificate-v2">
      <div className="completion-certificate-v2__border">
        {/* Header */}
        <div className="completion-certificate-v2__header">
          <div className="completion-certificate-v2__logo">
            <Award size={28} />
            <span className="completion-certificate-v2__brand">Orchestree</span>
          </div>
          <h1 className="completion-certificate-v2__title">Certificate of Completion</h1>
          <p className="completion-certificate-v2__subtitle">
            This document certifies that all required signatures have been collected.
          </p>
        </div>

        {/* Document info */}
        <div className="completion-certificate-v2__doc-info">
          <div className="completion-certificate-v2__doc-info-row">
            <span className="completion-certificate-v2__doc-info-label">Document</span>
            <span className="completion-certificate-v2__doc-info-value">{doc.name}</span>
          </div>
          <div className="completion-certificate-v2__doc-info-row">
            <span className="completion-certificate-v2__doc-info-label">Envelope ID</span>
            <span className="completion-certificate-v2__doc-info-value completion-certificate-v2__doc-info-value--mono">
              {doc.id}
            </span>
          </div>
          <div className="completion-certificate-v2__doc-info-row">
            <span className="completion-certificate-v2__doc-info-label">Completed</span>
            <span className="completion-certificate-v2__doc-info-value">
              {formatDate(completionDate)}
            </span>
          </div>
        </div>

        {/* Signers table */}
        <div className="completion-certificate-v2__section">
          <h2 className="completion-certificate-v2__section-title">Signers</h2>
          <table className="completion-certificate-v2__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Signed Date</th>
                <th>Signature</th>
              </tr>
            </thead>
            <tbody>
              {doc.signers.map((signer) => {
                const thumbnail = getSignatureThumbnail(signer.id)
                return (
                  <tr key={signer.id}>
                    <td>{signer.name}</td>
                    <td>{signer.email}</td>
                    <td>
                      <span
                        className={`completion-certificate-v2__status-badge completion-certificate-v2__status-badge--${signer.status}`}
                      >
                        {signer.status === 'signed' && <Check size={12} />}
                        {signer.status}
                      </span>
                    </td>
                    <td>
                      {signer.signedAt ? formatDate(signer.signedAt) : 'Not signed'}
                    </td>
                    <td>
                      {thumbnail ? (
                        <img
                          className="completion-certificate-v2__signature-img"
                          src={thumbnail}
                          alt={`Signature of ${signer.name}`}
                        />
                      ) : (
                        <span className="completion-certificate-v2__no-signature">--</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Audit trail */}
        <div className="completion-certificate-v2__section">
          <h2 className="completion-certificate-v2__section-title">Audit Trail</h2>
          <div className="completion-certificate-v2__audit-list" role="list" aria-label="Audit trail">
            {auditEntries.map((entry, i) => (
              <div
                key={`${entry.action}-${entry.timestamp}-${i}`}
                className="completion-certificate-v2__audit-item"
                role="listitem"
              >
                <div className="completion-certificate-v2__audit-icon">
                  {getAuditIcon(entry.action)}
                </div>
                <div className="completion-certificate-v2__audit-content">
                  <span className="completion-certificate-v2__audit-action">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>
                  {entry.detail && (
                    <span className="completion-certificate-v2__audit-detail">
                      {entry.detail}
                    </span>
                  )}
                </div>
                <span className="completion-certificate-v2__audit-time">
                  {formatDateTime(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate verification */}
        <div className="completion-certificate-v2__verification">
          <Shield size={16} />
          <span className="completion-certificate-v2__verification-label">Certificate ID:</span>
          <span className="completion-certificate-v2__verification-hash" data-testid="certificate-hash">
            {certificateHash}
          </span>
        </div>

        {/* Footer */}
        <div className="completion-certificate-v2__footer">
          <span className="completion-certificate-v2__powered">Powered by Orchestree</span>
        </div>

        {/* Actions (hidden on print) */}
        <div className="completion-certificate-v2__actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handlePrint}
            aria-label="Download PDF"
          >
            <Download size={16} />
            Download PDF
          </button>
          <button
            type="button"
            className={`btn-secondary${linkCopied ? ' completion-certificate-v2__btn--copied' : ''}`}
            onClick={handleCopyLink}
            aria-label="Copy Certificate Link"
          >
            {linkCopied ? <Check size={16} /> : <Link2 size={16} />}
            {linkCopied ? 'Copied!' : 'Copy Certificate Link'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompletionCertificate
