import { useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import PageHeader from '../components/PageHeader/PageHeader'
import BlockEditor from '../components/BlockEditor/BlockEditor'
import './PageEditorPage.css'

export default function PageEditorPage() {
  const { pageId } = useParams<{ pageId: string }>()
  const page = useWorkspaceStore((s) => (pageId ? s.pages[pageId] : undefined))
  const updatePage = useWorkspaceStore((s) => s.updatePage)

  // Update lastViewedAt on mount
  useEffect(() => {
    if (pageId && page) {
      updatePage(pageId, { lastViewedAt: new Date().toISOString() })
    }
  }, [pageId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTitleChange = useCallback(
    (title: string) => {
      if (pageId) {
        updatePage(pageId, { title })
      }
    },
    [pageId, updatePage]
  )

  const handleIconChange = useCallback(
    (icon: string) => {
      if (pageId) {
        updatePage(pageId, { icon })
      }
    },
    [pageId, updatePage]
  )

  const handleCoverChange = useCallback(
    (coverUrl: string) => {
      if (pageId) {
        updatePage(pageId, { coverUrl })
      }
    },
    [pageId, updatePage]
  )

  if (!page) {
    return (
      <div className="page-editor__not-found">
        <FileText size={48} />
        <h2>Page not found</h2>
        <p>This page doesn&apos;t exist or has been deleted.</p>
      </div>
    )
  }

  return (
    <div className="page-editor">
      <PageHeader
        page={page}
        onTitleChange={handleTitleChange}
        onIconChange={handleIconChange}
        onCoverChange={handleCoverChange}
      />
      <BlockEditor
        pageId={page.id}
        blockIds={page.blockIds}
      />
    </div>
  )
}
