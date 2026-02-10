import { Link } from 'react-router-dom'
import {
  FileText,
  FolderKanban,
  FileSignature,
  Calendar,
  Database,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useDocumentStore } from '../stores/useDocumentStore'
import { ACTIVE_STATUSES, DocumentStatus } from '../types'
import './HomePage.css'

export default function HomePage() {
  const documents = useDocumentStore((state) => state.documents)

  const stats = {
    total: documents.length,
    inProgress: documents.filter((d) => (ACTIVE_STATUSES as string[]).includes(d.status)).length,
    completed: documents.filter((d) => d.status === DocumentStatus.Completed).length,
  }

  const recentDocuments = documents.slice(0, 3)

  const quickActions = [
    { label: 'New Page', icon: FileText, path: '/pages/new', color: '#4F46E5' },
    { label: 'New Project', icon: FolderKanban, path: '/projects/new', color: '#0EA5E9' },
    { label: 'New Document', icon: FileSignature, path: '/documents', color: '#E94560' },
    { label: 'Schedule', icon: Calendar, path: '/calendar', color: '#10B981' },
    { label: 'New Database', icon: Database, path: '/data/new', color: '#F59E0B' },
  ]

  return (
    <div className="home-page">
      {/* Welcome Section */}
      <section className="home-page__welcome">
        <h1 className="home-page__title">
          Welcome to SignOf<span className="home-page__title-check">✓</span>
        </h1>
        <p className="home-page__subtitle">
          Your unified workspace for documents, projects, and more.
        </p>
      </section>

      {/* Stats Overview */}
      <section className="home-page__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--total">
            <TrendingUp size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.total}</span>
            <span className="stat-card__label">Total Documents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--pending">
            <Clock size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.inProgress}</span>
            <span className="stat-card__label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--completed">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.completed}</span>
            <span className="stat-card__label">Completed</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="home-page__section">
        <h2 className="home-page__section-title">Quick Actions</h2>
        <div className="quick-actions">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                to={action.path}
                className="quick-action"
                style={{ '--action-color': action.color } as React.CSSProperties}
              >
                <div className="quick-action__icon">
                  <Icon size={24} />
                </div>
                <span className="quick-action__label">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recent Documents */}
      {recentDocuments.length > 0 && (
        <section className="home-page__section">
          <div className="home-page__section-header">
            <h2 className="home-page__section-title">Recent Documents</h2>
            <Link to="/documents" className="home-page__see-all">
              See all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="recent-list">
            {recentDocuments.map((doc) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="recent-item"
              >
                <FileSignature size={20} className="recent-item__icon" />
                <div className="recent-item__content">
                  <span className="recent-item__name">{doc.name}</span>
                  <span className="recent-item__meta">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`recent-item__status recent-item__status--${doc.status}`}>
                  {doc.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Getting Started */}
      <section className="home-page__section home-page__getting-started">
        <h2 className="home-page__section-title">Getting Started</h2>
        <div className="getting-started-list">
          <div className="getting-started-item getting-started-item--done">
            <CheckCircle2 size={18} />
            <span>Create your workspace</span>
          </div>
          <div className="getting-started-item getting-started-item--done">
            <CheckCircle2 size={18} />
            <span>Upload your first document</span>
          </div>
          <div className="getting-started-item">
            <div className="getting-started-item__circle" />
            <span>Send a document for signature</span>
          </div>
          <div className="getting-started-item">
            <div className="getting-started-item__circle" />
            <span>Create your first project</span>
          </div>
          <div className="getting-started-item">
            <div className="getting-started-item__circle" />
            <span>Share your booking page</span>
          </div>
        </div>
      </section>
    </div>
  )
}
