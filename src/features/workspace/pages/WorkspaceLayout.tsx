import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Star, Clock } from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import PageTree from '../components/PageTree/PageTree'
import AIFeatureWidget from '../../ai/components/AIFeatureWidget/AIFeatureWidget'
import './WorkspaceLayout.css'

export default function WorkspaceLayout() {
  const navigate = useNavigate()
  const { pageId } = useParams()
  const pagesMap = useWorkspaceStore((s) => s.pages)
  const pages = useMemo(
    () => Object.values(pagesMap).filter((p) => !p.trashedAt),
    [pagesMap]
  )

  const getFavoritePages = useWorkspaceStore((s) => s.getFavoritePages)
  const getRecentPages = useWorkspaceStore((s) => s.getRecentPages)
  const toggleFavorite = useWorkspaceStore((s) => s.toggleFavorite)

  const favoritePages = useMemo(() => getFavoritePages(), [getFavoritePages, pagesMap]) // eslint-disable-line react-hooks/exhaustive-deps
  const recentPages = useMemo(() => getRecentPages(), [getRecentPages, pagesMap]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectPage = useCallback(
    (id: string) => {
      if (id) {
        navigate(`/pages/${id}`)
      } else {
        navigate('/pages')
      }
    },
    [navigate]
  )

  const handleNewPage = useCallback(
    (parentId?: string) => {
      if (parentId) {
        navigate(`/pages/new?parent=${parentId}`)
      } else {
        navigate('/pages/new')
      }
    },
    [navigate]
  )

  const handleToggleFavorite = useCallback(
    (pid: string) => {
      toggleFavorite(pid)
    },
    [toggleFavorite]
  )

  return (
    <div className="workspace-layout">
      <aside className="workspace-layout__sidebar">
        <ModuleHeader title="Pages" subtitle="Wiki, docs, and knowledge base" />
        {/* Favorites section */}
        {favoritePages.length > 0 && (
          <div className="workspace-layout__section">
            <div className="workspace-layout__section-header">
              <Star size={12} />
              <span>Favorites</span>
            </div>
            <div className="workspace-layout__section-list">
              {favoritePages.map((page) => (
                <button
                  key={page.id}
                  className={`workspace-layout__section-item ${pageId === page.id ? 'workspace-layout__section-item--active' : ''}`}
                  onClick={() => handleSelectPage(page.id)}
                >
                  <span className="workspace-layout__section-icon">{page.icon || '📄'}</span>
                  <span className="workspace-layout__section-title">{page.title || 'Untitled'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recently viewed section */}
        {recentPages.length > 0 && (
          <div className="workspace-layout__section">
            <div className="workspace-layout__section-header">
              <Clock size={12} />
              <span>Recently Viewed</span>
            </div>
            <div className="workspace-layout__section-list">
              {recentPages.slice(0, 5).map((page) => (
                <button
                  key={page.id}
                  className={`workspace-layout__section-item ${pageId === page.id ? 'workspace-layout__section-item--active' : ''}`}
                  onClick={() => handleSelectPage(page.id)}
                >
                  <span className="workspace-layout__section-icon">{page.icon || '📄'}</span>
                  <span className="workspace-layout__section-title">{page.title || 'Untitled'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <PageTree
          pages={pages}
          selectedPageId={pageId}
          onSelectPage={handleSelectPage}
          onNewPage={handleNewPage}
          onToggleFavorite={handleToggleFavorite}
        />
      </aside>
      <main className="workspace-layout__content">
        <Outlet />
      </main>
      <AIFeatureWidget featureKey="workspace" />
    </div>
  )
}
