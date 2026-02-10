import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import './WorkspaceAllPages.css'

export default function WorkspaceAllPages() {
  const navigate = useNavigate()
  const pages = useWorkspaceStore((s) => s.getAllPages())

  const handlePageClick = useCallback(
    (pageId: string) => {
      navigate(`/pages/${pageId}`)
    },
    [navigate]
  )

  const handleNewPage = useCallback(() => {
    navigate('/pages/new')
  }, [navigate])

  return (
    <div className="all-pages">
      <div className="all-pages__header">
        <h1 className="all-pages__title">All Pages</h1>
        <button className="btn-primary" onClick={handleNewPage}>
          <Plus size={16} />
          New Page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="all-pages__empty">
          <FileText size={48} />
          <h2>No pages yet</h2>
          <p>Create your first page to get started</p>
          <button className="btn-primary" onClick={handleNewPage}>
            Create a page
          </button>
        </div>
      ) : (
        <div className="all-pages__grid">
          {pages.map((page) => (
            <button
              key={page.id}
              className="all-pages__card"
              onClick={() => handlePageClick(page.id)}
            >
              <span className="all-pages__card-icon">
                {page.icon || <FileText size={20} />}
              </span>
              <span className="all-pages__card-title">
                {page.title || 'Untitled'}
              </span>
              <span className="all-pages__card-date">
                {new Date(page.updatedAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
