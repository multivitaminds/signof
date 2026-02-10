import { useCallback } from 'react'
import { Trash2, RotateCcw } from 'lucide-react'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import './TrashPage.css'

export default function TrashPage() {
  const getTrashedPages = useWorkspaceStore((s) => s.getTrashedPages)
  const restorePage = useWorkspaceStore((s) => s.restorePage)
  const permanentlyDeletePage = useWorkspaceStore((s) => s.permanentlyDeletePage)

  const trashedPages = getTrashedPages()

  const handleRestore = useCallback(
    (pageId: string) => {
      restorePage(pageId)
    },
    [restorePage]
  )

  const handlePermanentDelete = useCallback(
    (pageId: string) => {
      permanentlyDeletePage(pageId)
    },
    [permanentlyDeletePage]
  )

  return (
    <div className="trash-page">
      <div className="trash-page__header">
        <Trash2 size={24} />
        <h1 className="trash-page__title">Trash</h1>
      </div>

      {trashedPages.length === 0 ? (
        <div className="trash-page__empty">
          <Trash2 size={48} />
          <p>Trash is empty</p>
        </div>
      ) : (
        <div className="trash-page__list">
          {trashedPages.map((page) => (
            <div key={page.id} className="trash-page__item">
              <div className="trash-page__item-info">
                <span className="trash-page__item-icon">{page.icon || '📄'}</span>
                <span className="trash-page__item-title">{page.title}</span>
                <span className="trash-page__item-date">
                  Deleted {page.trashedAt ? new Date(page.trashedAt).toLocaleDateString() : ''}
                </span>
              </div>
              <div className="trash-page__item-actions">
                <button
                  className="trash-page__restore-btn"
                  onClick={() => handleRestore(page.id)}
                  title="Restore"
                  aria-label={`Restore ${page.title}`}
                >
                  <RotateCcw size={16} />
                  Restore
                </button>
                <button
                  className="trash-page__delete-btn btn-danger"
                  onClick={() => handlePermanentDelete(page.id)}
                  title="Delete permanently"
                  aria-label={`Permanently delete ${page.title}`}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
