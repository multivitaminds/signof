import { useCallback, useMemo } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import PageTree from '../components/PageTree/PageTree'
import './WorkspaceLayout.css'

export default function WorkspaceLayout() {
  const navigate = useNavigate()
  const { pageId } = useParams()
  const pagesMap = useWorkspaceStore((s) => s.pages)
  const pages = useMemo(
    () => Object.values(pagesMap).filter((p) => !p.trashedAt),
    [pagesMap]
  )

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

  return (
    <div className="workspace-layout">
      <aside className="workspace-layout__sidebar">
        <PageTree
          pages={pages}
          selectedPageId={pageId}
          onSelectPage={handleSelectPage}
          onNewPage={handleNewPage}
        />
      </aside>
      <main className="workspace-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
