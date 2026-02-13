import { useState, useCallback } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import usePlaygroundStore from '../../stores/usePlaygroundStore'
import { MODEL_CATALOG } from '../../lib/models'
import './ConversationSidebar.css'

function ConversationSidebar() {
  const conversations = usePlaygroundStore((s) => s.conversations)
  const activeConversationId = usePlaygroundStore((s) => s.activeConversationId)
  const searchQuery = usePlaygroundStore((s) => s.searchQuery)
  const createConversation = usePlaygroundStore((s) => s.createConversation)
  const deleteConversation = usePlaygroundStore((s) => s.deleteConversation)
  const setActiveConversation = usePlaygroundStore((s) => s.setActiveConversation)
  const renameConversation = usePlaygroundStore((s) => s.renameConversation)
  const setSearchQuery = usePlaygroundStore((s) => s.setSearchQuery)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleNewChat = useCallback(() => {
    createConversation()
  }, [createConversation])

  const handleSelect = useCallback((id: string) => {
    setActiveConversation(id)
  }, [setActiveConversation])

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteConversation(id)
  }, [deleteConversation])

  const handleDoubleClick = useCallback((id: string, title: string) => {
    setEditingId(id)
    setEditTitle(title)
  }, [])

  const handleRenameConfirm = useCallback(() => {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim())
    }
    setEditingId(null)
  }, [editingId, editTitle, renameConversation])

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameConfirm()
    if (e.key === 'Escape') setEditingId(null)
  }, [handleRenameConfirm])

  const filtered = searchQuery
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations

  return (
    <div className="conversation-sidebar">
      <button className="conversation-sidebar__new-btn" onClick={handleNewChat} type="button">
        <Plus size={16} />
        <span>New Chat</span>
      </button>

      <div className="conversation-sidebar__search">
        <Search size={14} className="conversation-sidebar__search-icon" />
        <input
          className="conversation-sidebar__search-input"
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="conversation-sidebar__list">
        {filtered.map((convo) => {
          const model = MODEL_CATALOG[convo.modelId]
          const isActive = convo.id === activeConversationId

          return (
            <div
              key={convo.id}
              className={`conversation-sidebar__item${isActive ? ' conversation-sidebar__item--active' : ''}`}
              onClick={() => handleSelect(convo.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(convo.id)}
            >
              {editingId === convo.id ? (
                <input
                  className="conversation-sidebar__rename-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleRenameConfirm}
                  onKeyDown={handleRenameKeyDown}
                  autoFocus
                />
              ) : (
                <div
                  className="conversation-sidebar__item-title"
                  onDoubleClick={() => handleDoubleClick(convo.id, convo.title)}
                >
                  {convo.title.length > 30 ? convo.title.slice(0, 30) + '...' : convo.title}
                </div>
              )}
              <div className="conversation-sidebar__item-meta">
                <span>{model.name}</span>
                <span>{convo.messages.length} msgs</span>
              </div>
              <button
                className="conversation-sidebar__delete-btn"
                onClick={(e) => handleDelete(e, convo.id)}
                type="button"
                aria-label={`Delete ${convo.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ConversationSidebar
