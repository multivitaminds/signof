import { create } from 'zustand'
import { useWorkspaceStore } from './useWorkspaceStore'
import { copilotChat, copilotAnalysis } from '../../ai/lib/copilotLLM'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Types ──────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string, context?: string): string {
  const msg = userMessage.toLowerCase()
  const ws = useWorkspaceStore.getState()
  const allPages = ws.getAllPages()
  const trashedPages = ws.getTrashedPages()
  const favorites = ws.getFavoritePages()
  const rootPages = ws.getRootPages()

  if (msg.includes('organiz') || msg.includes('structure')) {
    const childCounts = rootPages.map((p) => ({
      title: p.title || 'Untitled',
      children: ws.getChildPages(p.id).length,
    }))
    const deepest = childCounts.sort((a, b) => b.children - a.children)[0]
    return `Your workspace has ${rootPages.length} top-level pages and ${allPages.length} total pages. ${deepest ? `"${deepest.title}" has the most sub-pages (${deepest.children}).` : ''}\n\nTips for better organization:\n- Group related pages under parent pages\n- Use favorites for quick access to key docs\n- Archive stale pages to reduce clutter\n- Add icons and cover images for visual scanning`
  }

  if (msg.includes('template') || msg.includes('starter')) {
    return 'Page templates help you start faster. Try these patterns:\n- Meeting Notes: date, attendees, agenda, action items\n- Project Brief: overview, goals, timeline, stakeholders\n- Knowledge Base: topic, explanation, examples, related links\n- Weekly Update: highlights, blockers, next steps\n\nCreate a template by building a page, then duplicating it as your starting point.'
  }

  if (msg.includes('block') || msg.includes('slash')) {
    return 'Slash commands give you quick access to content blocks:\n- /heading — section headers (H1, H2, H3)\n- /list — bulleted or numbered lists\n- /todo — checkbox task lists\n- /code — code blocks with syntax highlighting\n- /quote — blockquotes for callouts\n- /divider — horizontal rule separators\n- /image — embed images\n- /table — data tables\n\nType / anywhere in the editor to see all available blocks.'
  }

  if (msg.includes('collaborat') || msg.includes('share') || msg.includes('team')) {
    return 'Collaboration features in your workspace:\n- Share pages with team members for real-time editing\n- Use @mentions to notify teammates in page content\n- Add comments to specific blocks for discussion\n- Track page history to see who changed what\n- Lock pages to prevent accidental edits\n\nAll changes are saved automatically and visible to collaborators in real-time.'
  }

  if (msg.includes('link') || msg.includes('connect') || msg.includes('reference')) {
    return 'Connect your pages with internal links:\n- Type [[ to search and link to any page\n- Use @mentions to reference team members\n- Create a table of contents with /toc\n- Backlinks show which pages reference the current one\n\nWell-linked pages create a knowledge graph that makes information easy to discover.'
  }

  if (msg.includes('trash') || msg.includes('delete') || msg.includes('archive')) {
    return `You currently have ${trashedPages.length} page(s) in the trash. Trashed pages can be restored or permanently deleted.\n\nTips:\n- Trash pages you no longer need instead of leaving them cluttered\n- Restore accidentally deleted pages from the Trash view\n- Permanently delete sensitive content when appropriate\n- Consider archiving (moving under an "Archive" parent) instead of trashing for reference material`
  }

  if (msg.includes('favorite') || msg.includes('bookmark') || msg.includes('pin')) {
    return `You have ${favorites.length} favorited page(s). Favorites appear at the top of the sidebar for quick access.\n\nBest practices:\n- Favorite your most-used daily pages\n- Keep favorites under 10 for quick scanning\n- Remove favorites you haven't visited in a while\n- Use favorites as your personal "dashboard" of key docs`
  }

  if (msg.includes('search') || msg.includes('find')) {
    return 'Finding content in your workspace:\n- Use Cmd+K to open the command palette and search all pages\n- Search matches page titles, content, and tags\n- Filter by recently viewed, favorites, or all pages\n- The sidebar page tree shows your full hierarchy\n\nFor large workspaces, good naming conventions and folder structure make search much easier.'
  }

  if (context) {
    const page = ws.pages[context]
    if (page) {
      const children = ws.getChildPages(context)
      const comments = ws.getPageComments(context)
      return `You're viewing "${page.title || 'Untitled'}". This page has ${children.length} sub-page(s) and ${comments.length} comment(s). ${page.icon ? `Icon: ${page.icon}` : 'No icon set — add one for better visual organization.'}`
    }
  }

  return `I'm your Workspace Copilot — here to help you create and organize your knowledge base. You have ${allPages.length} page(s) across ${rootPages.length} top-level sections, with ${favorites.length} favorite(s).\n\nI can help with:\n- Organizing your page structure\n- Using slash commands and blocks\n- Collaboration and sharing\n- Templates and best practices\n- Finding and linking content\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface WorkspaceCopilotState {
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  isAnalyzing: boolean
  lastAnalysis: {
    type: 'structure' | 'content' | 'activity'
    summary: string
    items: string[]
    timestamp: string
  } | null
  analyzeStructure: () => void
  reviewContent: () => void
  suggestCleanup: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useWorkspaceCopilotStore = create<WorkspaceCopilotState>()(
  (set) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    isAnalyzing: false,
    lastAnalysis: null,

    openPanel: () => set({ isOpen: true }),
    closePanel: () => set({ isOpen: false }),
    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    sendMessage: (content, context) => {
      const userMessage: CopilotMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        context,
      }

      set((state) => ({
        messages: [...state.messages, userMessage],
        isTyping: true,
      }))

      const ws = useWorkspaceStore.getState()
      const allPages = ws.getAllPages()
      const contextSummary = `${allPages.length} pages, ${ws.getFavoritePages().length} favorites`

      copilotChat('Workspace', content, contextSummary, () => generateResponse(content, context))
        .then((responseContent) => {
          const assistantMessage: CopilotMessage = {
            id: generateId(),
            role: 'assistant',
            content: responseContent,
            timestamp: new Date().toISOString(),
          }

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isTyping: false,
          }))
        })
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    analyzeStructure: () => {
      set({ isAnalyzing: true })

      const ws = useWorkspaceStore.getState()
      const allPages = ws.getAllPages()
      const rootPages = ws.getRootPages()
      const favorites = ws.getFavoritePages()
      const dataContext = `${allPages.length} pages, ${rootPages.length} root sections, ${favorites.length} favorites`

      const fallbackFn = () => {
        const items: string[] = []
        items.push(`${allPages.length} total pages across ${rootPages.length} top-level sections`)
        const orphans = allPages.filter((p) => !p.parentId && !rootPages.includes(p))
        if (orphans.length > 0) items.push(`${orphans.length} orphan page(s) without a parent`)
        const untitled = allPages.filter((p) => !p.title || p.title === 'Untitled')
        if (untitled.length > 0) items.push(`${untitled.length} untitled page(s) — consider naming them`)
        if (favorites.length === 0) items.push('No favorite pages — star important pages for quick access')
        const deepPages = rootPages.filter((p) => ws.getChildPages(p.id).length > 10)
        if (deepPages.length > 0) items.push(`${deepPages.length} section(s) with 10+ sub-pages — consider splitting`)
        return { summary: items.length > 1 ? `Found ${items.length} structural insights.` : 'Your workspace structure looks clean!', items }
      }

      copilotAnalysis('Workspace', 'structure', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'structure', ...result, timestamp: new Date().toISOString() } })
        })
    },

    reviewContent: () => {
      set({ isAnalyzing: true })

      const ws = useWorkspaceStore.getState()
      const allPages = ws.getAllPages()
      const dataContext = `${allPages.length} pages`

      const fallbackFn = () => {
        const items: string[] = []
        const withComments = allPages.filter((p) => ws.getPageComments(p.id).length > 0)
        items.push(`${withComments.length} page(s) have comments or discussions`)
        const recent = ws.getRecentPages()
        items.push(`${recent.length} recently viewed page(s)`)
        const noIcon = allPages.filter((p) => !p.icon)
        if (noIcon.length > 3) items.push(`${noIcon.length} pages without icons — add icons for visual clarity`)
        return { summary: `Reviewed ${allPages.length} page(s) for content health.`, items }
      }

      copilotAnalysis('Workspace', 'content', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'content', ...result, timestamp: new Date().toISOString() } })
        })
    },

    suggestCleanup: () => {
      set({ isAnalyzing: true })

      const ws = useWorkspaceStore.getState()
      const trashedPages = ws.getTrashedPages()
      const allPages = ws.getAllPages()
      const dataContext = `${allPages.length} pages, ${trashedPages.length} trashed`

      const fallbackFn = () => {
        const items: string[] = []
        if (trashedPages.length > 0) items.push(`${trashedPages.length} page(s) in trash — review and permanently delete or restore`)
        const untitled = allPages.filter((p) => !p.title || p.title === 'Untitled')
        if (untitled.length > 0) items.push(`${untitled.length} untitled page(s) — name them or remove if unused`)
        const emptyPages = allPages.filter((p) => p.blockIds.length === 0)
        if (emptyPages.length > 0) items.push(`${emptyPages.length} empty page(s) with no content`)
        return { summary: items.length > 0 ? `Found ${items.length} cleanup opportunity(ies).` : 'Your workspace is tidy — no cleanup needed!', items }
      }

      copilotAnalysis('Workspace', 'cleanup', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'activity', ...result, timestamp: new Date().toISOString() } })
        })
    },
  })
)
