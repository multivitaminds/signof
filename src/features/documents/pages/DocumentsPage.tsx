import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { DocumentStatus, STATUS_LABELS } from '../../../types'
import type { Document } from '../../../types'
import './DocumentsPage.css'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'name-asc'

const STATUS_FILTERS: { label: string; value: DocumentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: DocumentStatus.Draft },
  { label: 'Pending', value: DocumentStatus.Pending },
  { label: 'Completed', value: DocumentStatus.Completed },
  { label: 'Voided', value: DocumentStatus.Voided },
  { label: 'Declined', value: DocumentStatus.Declined },
]

function getStatusClass(status: DocumentStatus): string {
  switch (status) {
    case DocumentStatus.Draft: return 'docs-hub__badge--draft'
    case DocumentStatus.Pending:
    case DocumentStatus.Sent:
    case DocumentStatus.Delivered:
    case DocumentStatus.Viewed:
      return 'docs-hub__badge--pending'
    case DocumentStatus.Completed:
    case DocumentStatus.Signed:
      return 'docs-hub__badge--completed'
    case DocumentStatus.Declined: return 'docs-hub__badge--declined'
    case DocumentStatus.Voided: return 'docs-hub__badge--voided'
    default: return ''
  }
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

function sortDocuments(docs: Document[], sort: SortOption): Document[] {
  const sorted = [...docs]
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return sorted
  }
}

export default function DocumentsHubPage() {
  const { documents, deleteDocument, sendDocument } = useDocumentStore()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredDocs = useMemo(() => {
    let result = documents
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(d => d.name.toLowerCase().includes(q))
    }
    return sortDocuments(result, sortBy)
  }, [documents, statusFilter, searchQuery, sortBy])

  const [currentTime] = useState(() => Date.now())
  const stats = useMemo(() => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    return {
      total: documents.length,
      pending: documents.filter(d => d.status === DocumentStatus.Pending || d.status === DocumentStatus.Sent || d.status === DocumentStatus.Delivered || d.status === DocumentStatus.Viewed).length,
      completed: documents.filter(d => d.status === DocumentStatus.Completed).length,
      expiring: documents.filter(d => {
        if (!d.expiresAt) return false
        const exp = new Date(d.expiresAt).getTime()
        return exp - currentTime < sevenDays && exp > currentTime
      }).length,
    }
  }, [documents, currentTime])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBulkDelete = useCallback(() => {
    for (const id of selectedIds) {
      deleteDocument(id)
    }
    setSelectedIds(new Set())
  }, [selectedIds, deleteDocument])

  const handleBulkSend = useCallback(() => {
    for (const id of selectedIds) {
      sendDocument(id)
    }
    setSelectedIds(new Set())
  }, [selectedIds, sendDocument])

  const signerProgress = useCallback((doc: Document) => {
    const signers = doc.signers.filter(s => s.role === 'signer')
    const signed = signers.filter(s => s.status === 'signed').length
    return { signed, total: signers.length }
  }, [])

  return (
    <div className="docs-hub">
      {/* Header */}
      <ModuleHeader
        title="Documents"
        subtitle="Upload, sign, and manage documents"
        actions={
          <div className="docs-hub__header-right">
            <div className="docs-hub__view-toggle" role="group" aria-label="View mode">
              <button
                className={`docs-hub__view-btn${viewMode === 'grid' ? ' docs-hub__view-btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <button
                className={`docs-hub__view-btn${viewMode === 'list' ? ' docs-hub__view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <line x1="1" y1="3" x2="15" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="1" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <Link to="/documents/builder" className="btn-primary docs-hub__new-btn">
              New Document
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="docs-hub__stats">
        <div className="docs-hub__stat docs-hub__stat--total">
          <span className="docs-hub__stat-value">{stats.total}</span>
          <span className="docs-hub__stat-label">Total</span>
        </div>
        <div className="docs-hub__stat docs-hub__stat--pending">
          <span className="docs-hub__stat-value">{stats.pending}</span>
          <span className="docs-hub__stat-label">Pending</span>
        </div>
        <div className="docs-hub__stat docs-hub__stat--completed">
          <span className="docs-hub__stat-value">{stats.completed}</span>
          <span className="docs-hub__stat-label">Completed</span>
        </div>
        <div className="docs-hub__stat docs-hub__stat--expiring">
          <span className="docs-hub__stat-value">{stats.expiring}</span>
          <span className="docs-hub__stat-label">Expiring Soon</span>
        </div>
      </div>

      {/* Filters */}
      <div className="docs-hub__filters">
        <div className="docs-hub__filter-chips" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`docs-hub__filter-chip${statusFilter === f.value ? ' docs-hub__filter-chip--active' : ''}`}
              onClick={() => setStatusFilter(f.value)}
              aria-pressed={statusFilter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="docs-hub__filter-controls">
          <input
            type="search"
            className="docs-hub__search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search documents"
          />
          <select
            className="docs-hub__sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            aria-label="Sort documents"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="docs-hub__bulk-bar" role="toolbar" aria-label="Bulk actions">
          <span className="docs-hub__bulk-count">{selectedIds.size} selected</span>
          <button className="btn-danger docs-hub__bulk-btn" onClick={handleBulkDelete}>Delete</button>
          <button className="btn-primary docs-hub__bulk-btn" onClick={handleBulkSend}>Send</button>
          <button className="btn-secondary docs-hub__bulk-btn" onClick={() => setSelectedIds(new Set())}>Cancel</button>
        </div>
      )}

      {/* Document Grid/List */}
      {filteredDocs.length === 0 ? (
        <div className="docs-hub__empty">
          <div className="docs-hub__empty-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="4" width="32" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
              <line x1="16" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="32" x2="24" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="docs-hub__empty-title">No documents found</h3>
          <p className="docs-hub__empty-text">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Upload your first document to get started.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link to="/documents/builder" className="btn-primary">
              Upload Document
            </Link>
          )}
        </div>
      ) : (
        <div className={`docs-hub__grid ${viewMode === 'list' ? 'docs-hub__grid--list' : ''}`}>
          {filteredDocs.map(doc => {
            const progress = signerProgress(doc)
            return (
              <div
                key={doc.id}
                className={`docs-hub__card ${selectedIds.has(doc.id) ? 'docs-hub__card--selected' : ''}`}
              >
                <div className="docs-hub__card-header">
                  <label className="docs-hub__card-check">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                      aria-label={`Select ${doc.name}`}
                    />
                  </label>
                  <span className={`docs-hub__badge ${getStatusClass(doc.status)}`}>
                    {STATUS_LABELS[doc.status]}
                  </span>
                </div>
                <h3 className="docs-hub__card-name" title={doc.name}>{doc.name}</h3>
                <time className="docs-hub__card-date" dateTime={doc.createdAt}>
                  {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </time>
                {doc.signers.length > 0 && (
                  <div className="docs-hub__card-signers">
                    <div className="docs-hub__avatars">
                      {doc.signers.slice(0, 3).map(s => (
                        <span key={s.id} className="docs-hub__avatar" title={s.name}>
                          {getInitials(s.name)}
                        </span>
                      ))}
                      {doc.signers.length > 3 && (
                        <span className="docs-hub__avatar docs-hub__avatar--more">
                          +{doc.signers.length - 3}
                        </span>
                      )}
                    </div>
                    {progress.total > 0 && (
                      <div className="docs-hub__progress">
                        <div className="docs-hub__progress-bar">
                          <div
                            className="docs-hub__progress-fill"
                            style={{ width: `${progress.total > 0 ? (progress.signed / progress.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="docs-hub__progress-text">{progress.signed}/{progress.total}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="docs-hub__card-actions">
                  <Link to={`/documents/${doc.id}`} className="docs-hub__action-btn" aria-label={`View ${doc.name}`}>
                    View
                  </Link>
                  <button className="docs-hub__action-btn docs-hub__action-btn--danger" onClick={() => deleteDocument(doc.id)} aria-label={`Delete ${doc.name}`}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
