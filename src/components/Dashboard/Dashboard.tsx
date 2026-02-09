import { type Document, DocumentStatus } from '../../types'
import DocumentList from '../DocumentList/DocumentList'
import './Dashboard.css'

interface DashboardProps {
  documents: Document[]
  onNewDocument: () => void
  onSign: (docId: string) => void
  onDelete: (docId: string) => void
  onView: (docId: string) => void
}

function Dashboard({
  documents,
  onNewDocument,
  onSign,
  onDelete,
  onView,
}: DashboardProps) {
  const totalCount = documents.length
  const pendingCount = documents.filter(
    (doc) => doc.status === DocumentStatus.Pending
  ).length
  const completedCount = documents.filter(
    (doc) => doc.status === DocumentStatus.Completed
  ).length

  return (
    <section className="dashboard">
      <div className="dashboard-top-bar">
        <div className="dashboard-stats" role="list" aria-label="Document statistics">
          <div className="stat-card" role="listitem">
            <span className="stat-number">{totalCount}</span>
            <span className="stat-label">Total Documents</span>
          </div>
          <div className="stat-card stat-card--pending" role="listitem">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-label">Pending Signatures</span>
          </div>
          <div className="stat-card stat-card--completed" role="listitem">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <button className="new-document-btn" onClick={onNewDocument}>
          + New Document
        </button>
      </div>
      <DocumentList
        documents={documents}
        onSign={onSign}
        onDelete={onDelete}
        onView={onView}
      />
    </section>
  )
}

export default Dashboard
