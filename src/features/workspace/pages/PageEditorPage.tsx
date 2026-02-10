import { useEffect, useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FileText, Clock, Download, FileDown } from 'lucide-react'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import PageHeader from '../components/PageHeader/PageHeader'
import BlockEditor from '../components/BlockEditor/BlockEditor'
import PageProperties from '../components/PageProperties/PageProperties'
import VersionHistory from '../components/VersionHistory/VersionHistory'
import { pageToMarkdown, pageToHTML } from '../lib/exportPage'
import type { PagePropertyValue } from '../types'
import './PageEditorPage.css'

export default function PageEditorPage() {
  const { pageId } = useParams<{ pageId: string }>()
  const page = useWorkspaceStore((s) => (pageId ? s.pages[pageId] : undefined))
  const blocks = useWorkspaceStore((s) => s.blocks)
  const updatePage = useWorkspaceStore((s) => s.updatePage)
  const updatePageProperties = useWorkspaceStore((s) => s.updatePageProperties)
  const getBacklinks = useWorkspaceStore((s) => s.getBacklinks)
  const getPageHistory = useWorkspaceStore((s) => s.getPageHistory)
  const createSnapshot = useWorkspaceStore((s) => s.createSnapshot)
  const restoreSnapshot = useWorkspaceStore((s) => s.restoreSnapshot)
  const deleteSnapshot = useWorkspaceStore((s) => s.deleteSnapshot)

  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

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

  const handlePropertiesChange = useCallback(
    (properties: Record<string, PagePropertyValue>) => {
      if (pageId) {
        updatePageProperties(pageId, properties)
      }
    },
    [pageId, updatePageProperties]
  )

  const handleExport = useCallback(
    (format: 'markdown' | 'html') => {
      if (!page) return

      const blockData = page.blockIds.map((bid) => {
        const block = blocks[bid]
        return block
          ? { type: block.type, content: block.content, properties: block.properties as Record<string, unknown> }
          : { type: 'paragraph', content: '' }
      })

      const content = format === 'markdown'
        ? pageToMarkdown(page.title, blockData)
        : pageToHTML(page.title, blockData)

      const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown' : 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${page.title}.${format === 'markdown' ? 'md' : 'html'}`
      a.click()
      URL.revokeObjectURL(url)
      setShowExportMenu(false)
    },
    [page, blocks]
  )

  const handleCreateSnapshot = useCallback(() => {
    if (pageId) {
      createSnapshot(pageId)
    }
  }, [pageId, createSnapshot])

  const handleRestoreSnapshot = useCallback(
    (snapshotId: string) => {
      if (pageId) {
        restoreSnapshot(snapshotId, pageId)
      }
    },
    [pageId, restoreSnapshot]
  )

  const handleDeleteSnapshot = useCallback(
    (snapshotId: string) => {
      if (pageId) {
        deleteSnapshot(snapshotId, pageId)
      }
    },
    [pageId, deleteSnapshot]
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

  const backlinks = pageId ? getBacklinks(pageId) : []
  const snapshots = pageId ? getPageHistory(pageId) : []

  return (
    <div className={`page-editor-layout ${showVersionHistory ? 'page-editor-layout--with-history' : ''}`}>
      <div className="page-editor">
        {/* Page toolbar */}
        <div className="page-editor__toolbar">
          <div className="page-editor__toolbar-actions">
            <div className="page-editor__export-wrapper">
              <button
                className="page-editor__toolbar-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Export"
              >
                <Download size={16} />
              </button>
              {showExportMenu && (
                <div className="page-editor__export-menu">
                  <button
                    className="page-editor__export-option"
                    onClick={() => handleExport('markdown')}
                  >
                    <FileDown size={14} />
                    Markdown
                  </button>
                  <button
                    className="page-editor__export-option"
                    onClick={() => handleExport('html')}
                  >
                    <FileDown size={14} />
                    HTML
                  </button>
                </div>
              )}
            </div>
            <button
              className={`page-editor__toolbar-btn ${showVersionHistory ? 'page-editor__toolbar-btn--active' : ''}`}
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              title="Version history"
            >
              <Clock size={16} />
            </button>
          </div>
        </div>

        <PageHeader
          page={page}
          onTitleChange={handleTitleChange}
          onIconChange={handleIconChange}
          onCoverChange={handleCoverChange}
        />

        <PageProperties
          properties={page.properties}
          onUpdate={handlePropertiesChange}
        />

        <BlockEditor
          pageId={page.id}
          blockIds={page.blockIds}
        />

        {/* Backlinks */}
        {backlinks.length > 0 && (
          <div className="page-editor__backlinks">
            <h3 className="page-editor__backlinks-title">Linked to this page</h3>
            <div className="page-editor__backlinks-list">
              {backlinks.map((link) => (
                <Link
                  key={`${link.pageId}-${link.blockId}`}
                  to={`/pages/${link.pageId}`}
                  className="page-editor__backlink"
                >
                  {link.pageTitle}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Version History Panel */}
      <VersionHistory
        isOpen={showVersionHistory}
        pageId={pageId ?? ''}
        snapshots={snapshots}
        onCreateSnapshot={handleCreateSnapshot}
        onRestore={handleRestoreSnapshot}
        onDelete={handleDeleteSnapshot}
        onClose={() => setShowVersionHistory(false)}
      />
    </div>
  )
}
