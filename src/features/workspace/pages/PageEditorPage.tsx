import { useEffect, useCallback, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FileText, Clock, Download, FileDown, MessageSquare, Undo2, Redo2, Share2, Star } from 'lucide-react'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import PageHeader from '../components/PageHeader/PageHeader'
import BlockEditor from '../components/BlockEditor/BlockEditor'
import PageProperties from '../components/PageProperties/PageProperties'
import VersionHistory from '../components/VersionHistory/VersionHistory'
import CommentsSidebar from '../components/CommentsSidebar/CommentsSidebar'
import PageBreadcrumb from '../components/PageBreadcrumb/PageBreadcrumb'
import PresenceAvatars from '../components/PresenceAvatars/PresenceAvatars'
import PresenceCursors from '../components/PresenceAvatars/PresenceCursors'
import ShareDialog from '../components/ShareDialog/ShareDialog'
import usePresenceSimulator from '../hooks/usePresenceSimulator'
import useWordCount from '../hooks/useWordCount'
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
  const toggleFavorite = useWorkspaceStore((s) => s.toggleFavorite)
  const addToRecent = useWorkspaceStore((s) => s.addToRecent)

  const undo = useWorkspaceStore((s) => s.undo)
  const redo = useWorkspaceStore((s) => s.redo)
  const canUndo = useWorkspaceStore((s) => s.canUndo)
  const canRedo = useWorkspaceStore((s) => s.canRedo)

  const pageComments = useWorkspaceStore((s) => (pageId ? s.comments[pageId] ?? [] : []))

  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  // Presence simulation
  const presenceUsers = usePresenceSimulator(pageId ?? '')

  // Word count
  const wordCountData = useWordCount(page?.blockIds ?? [])

  // Update lastViewedAt and add to recent on mount
  useEffect(() => {
    if (pageId && page) {
      updatePage(pageId, { lastViewedAt: new Date().toISOString() })
      addToRecent(pageId)
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
          ? { type: block.type, content: block.content, properties: block.properties as Record<string, unknown>, marks: block.marks }
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

  const handleCommentClick = useCallback(
    (blockId: string) => {
      // Scroll to and highlight the block
      const blockEl = document.querySelector(`[data-block-id="${blockId}"]`)
      if (blockEl) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        blockEl.classList.add('block-editor__block--highlighted')
        setTimeout(() => {
          blockEl.classList.remove('block-editor__block--highlighted')
        }, 2000)
      }
    },
    []
  )

  const handleToggleFavorite = useCallback(() => {
    if (pageId) {
      toggleFavorite(pageId)
    }
  }, [pageId, toggleFavorite])

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

  const totalComments = pageComments.length
  const openCommentCount = pageComments.filter((c) => !c.resolved).length
  const hasSidePanel = showVersionHistory || showCommentsSidebar

  return (
    <div className={`page-editor-layout ${hasSidePanel ? 'page-editor-layout--with-history' : ''}`}>
      <div className="page-editor">
        {/* Breadcrumb trail */}
        {pageId && <PageBreadcrumb pageId={pageId} />}

        {/* Page toolbar */}
        <div className="page-editor__toolbar">
          {/* Left side: info bar */}
          <div className="page-editor__toolbar-info">
            {/* Comment summary */}
            {totalComments > 0 && (
              <span className="page-editor__info-item page-editor__info-item--comments">
                {totalComments} comment{totalComments === 1 ? '' : 's'}
                {openCommentCount > 0 && ` (${openCommentCount} open)`}
              </span>
            )}
            {/* Word count / reading time */}
            {wordCountData.wordCount > 0 && (
              <span className="page-editor__info-item">
                {wordCountData.readingTimeLabel}
              </span>
            )}
          </div>

          {/* Right side: actions */}
          <div className="page-editor__toolbar-actions">
            {/* Presence avatars */}
            <PresenceAvatars users={presenceUsers} />

            <button
              className={`page-editor__toolbar-btn ${page.isFavorite ? 'page-editor__toolbar-btn--favorite' : ''}`}
              onClick={handleToggleFavorite}
              title={page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={16} fill={page.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              className="page-editor__toolbar-btn"
              onClick={() => setShowShareDialog(true)}
              title="Share"
              aria-label="Share page"
            >
              <Share2 size={16} />
            </button>
            <button
              className="page-editor__toolbar-btn"
              onClick={undo}
              disabled={!canUndo()}
              title="Undo"
              aria-label="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              className="page-editor__toolbar-btn"
              onClick={redo}
              disabled={!canRedo()}
              title="Redo"
              aria-label="Redo"
            >
              <Redo2 size={16} />
            </button>
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
              className={`page-editor__toolbar-btn page-editor__toolbar-btn--comments ${showCommentsSidebar ? 'page-editor__toolbar-btn--active' : ''}`}
              onClick={() => {
                setShowCommentsSidebar(!showCommentsSidebar)
                if (!showCommentsSidebar) setShowVersionHistory(false)
              }}
              title="Comments"
            >
              <MessageSquare size={16} />
              {openCommentCount > 0 && (
                <span className="page-editor__comment-badge">{openCommentCount}</span>
              )}
            </button>
            <button
              className={`page-editor__toolbar-btn ${showVersionHistory ? 'page-editor__toolbar-btn--active' : ''}`}
              onClick={() => {
                setShowVersionHistory(!showVersionHistory)
                if (!showVersionHistory) setShowCommentsSidebar(false)
              }}
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

        {/* Editor with presence cursors */}
        <div className="page-editor__editor-wrapper">
          <PresenceCursors users={presenceUsers} />
          <BlockEditor
            pageId={page.id}
            blockIds={page.blockIds}
          />
        </div>

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

      {/* Comments Sidebar */}
      <CommentsSidebar
        isOpen={showCommentsSidebar}
        pageId={pageId ?? ''}
        onClose={() => setShowCommentsSidebar(false)}
        onCommentClick={handleCommentClick}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        pageTitle={page.title}
        onClose={() => setShowShareDialog(false)}
      />
    </div>
  )
}
