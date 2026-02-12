import { useState, useMemo, useCallback } from 'react'
import { useMemoryStore } from '../stores/useMemoryStore'
import { getCategoryStats, getInsights, MEMORY_TEMPLATES } from '../lib/memoryTemplates'
import type { MemoryCategory, MemoryInsight, MemoryScope } from '../types'
import MemoryHero from '../components/MemoryHero/MemoryHero'
import MemoryCategoryBar from '../components/MemoryCategoryBar/MemoryCategoryBar'
import MemoryQuickStart from '../components/MemoryQuickStart/MemoryQuickStart'
import MemoryExplorer from '../components/MemoryExplorer/MemoryExplorer'
import MemoryInsightsPanel from '../components/MemoryInsightsPanel/MemoryInsightsPanel'
import MemoryEntryModal from '../components/MemoryEntryModal/MemoryEntryModal'
import './AIMemoryPage.css'

export default function AIMemoryPage() {
  const entries = useMemoryStore((s) => s.entries)
  const activeTab = useMemoryStore((s) => s.activeTab)
  const setActiveTab = useMemoryStore((s) => s.setActiveTab)
  const addEntry = useMemoryStore((s) => s.addEntry)

  const [showQuickStart, setShowQuickStart] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [templatePrefill, setTemplatePrefill] = useState<{
    title: string
    content: string
    category: MemoryCategory
    tags: string[]
  } | null>(null)

  const totalTokens = useMemo(
    () => entries.reduce((sum, e) => sum + e.tokenCount, 0),
    [entries],
  )

  const categoryStats = useMemo(
    () => getCategoryStats(entries),
    [entries],
  )

  const insights = useMemo(
    () => getInsights(entries),
    [entries],
  )

  const existingTags = useMemo(
    () => Array.from(new Set(entries.flatMap((e) => e.tags))),
    [entries],
  )

  const shouldShowQuickStart = entries.length < 3 || showQuickStart

  const handleUseTemplate = useCallback((templateId: string) => {
    const template = MEMORY_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return
    setTemplatePrefill({
      title: template.title,
      content: template.placeholder,
      category: template.category,
      tags: template.tags,
    })
    setTemplateModalOpen(true)
    setShowQuickStart(false)
  }, [])

  const handleInsightAction = useCallback((insight: MemoryInsight) => {
    if (insight.action?.templateId) {
      handleUseTemplate(insight.action.templateId)
    }
  }, [handleUseTemplate])

  const handleTemplateSave = useCallback(
    async (title: string, content: string, category: MemoryCategory, tags: string[], scope: MemoryScope) => {
      await addEntry(title, content, category, tags, scope, { sourceType: 'template' })
      setTemplateModalOpen(false)
      setTemplatePrefill(null)
    },
    [addEntry],
  )

  const handleTemplateCancel = useCallback(() => {
    setTemplateModalOpen(false)
    setTemplatePrefill(null)
  }, [])

  return (
    <div className="ai-memory-page">
      <MemoryHero
        totalTokens={totalTokens}
        entryCount={entries.length}
        categoryStats={categoryStats}
      />

      <MemoryCategoryBar
        activeTab={activeTab}
        categoryStats={categoryStats}
        totalEntries={entries.length}
        onTabChange={setActiveTab}
      />

      {shouldShowQuickStart && (
        <MemoryQuickStart onUseTemplate={handleUseTemplate} />
      )}

      <div className="ai-memory-page__content">
        <div className="ai-memory-page__main">
          <MemoryExplorer onShowTemplates={() => setShowQuickStart(true)} />
        </div>
        <aside className="ai-memory-page__sidebar">
          <MemoryInsightsPanel
            categoryStats={categoryStats}
            insights={insights}
            onActionClick={handleInsightAction}
          />
        </aside>
      </div>

      {templateModalOpen && (
        <MemoryEntryModal
          onSave={handleTemplateSave}
          onCancel={handleTemplateCancel}
          existingTags={existingTags}
          initialFromTemplate={templatePrefill ?? undefined}
        />
      )}
    </div>
  )
}
