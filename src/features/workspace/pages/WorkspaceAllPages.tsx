import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import EmptyState from '../../../components/EmptyState/EmptyState'
import './WorkspaceAllPages.css'

export default function WorkspaceAllPages() {
  const navigate = useNavigate()
  const pagesMap = useWorkspaceStore((s) => s.pages)
  const pages = useMemo(
    () => Object.values(pagesMap)
      .filter((p) => !p.trashedAt)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [pagesMap]
  )

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
        <EmptyState
          icon={<FileText size={36} />}
          title="Create your first page"
          description="Write docs, notes, and wikis with a powerful block editor. Use slash commands, @mentions, and more."
          action={{ label: 'New Page', onClick: handleNewPage }}
        />
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
