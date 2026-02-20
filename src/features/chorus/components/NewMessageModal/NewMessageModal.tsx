import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, Search, Check } from 'lucide-react'
import { useChorusStore } from '../../stores/useChorusStore'
import PresenceAvatar from '../PresenceAvatar/PresenceAvatar'
import './NewMessageModal.css'

interface NewMessageModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NewMessageModal({ isOpen, onClose }: NewMessageModalProps) {
  const users = useChorusStore((s) => s.users)
  const currentUserId = useChorusStore((s) => s.currentUserId)
  const createDM = useChorusStore((s) => s.createDM)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const otherUsers = useMemo(
    () => users.filter((u) => u.id !== currentUserId),
    [users, currentUserId]
  )

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return otherUsers
    const lower = searchQuery.toLowerCase()
    return otherUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(lower) ||
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
    )
  }, [otherUsers, searchQuery])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleToggleUser = useCallback((userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }, [])

  const handleCreate = useCallback(() => {
    if (selectedUserIds.length === 0) return

    const participantIds = [currentUserId, ...selectedUserIds]
    const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id))
    const name =
      selectedUsers.length === 1
        ? selectedUsers[0]?.displayName ?? 'Direct Message'
        : selectedUsers.map((u) => u.displayName).join(', ')

    createDM(participantIds, name)
    onClose()
  }, [selectedUserIds, currentUserId, users, createDM, onClose])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="New message"
    >
      <div className="modal-content new-message-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>New Message</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="new-message-modal__search">
          <Search size={16} className="new-message-modal__search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="new-message-modal__search-input"
            placeholder="Search people..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search people"
          />
        </div>

        {selectedUserIds.length > 0 && (
          <div className="new-message-modal__selected" aria-label="Selected users">
            {selectedUserIds.map((userId) => {
              const user = users.find((u) => u.id === userId)
              if (!user) return null
              return (
                <span key={userId} className="new-message-modal__chip">
                  {user.displayName}
                  <button
                    className="new-message-modal__chip-remove"
                    onClick={() => handleToggleUser(userId)}
                    aria-label={`Remove ${user.displayName}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              )
            })}
          </div>
        )}

        <ul className="new-message-modal__user-list" role="listbox" aria-label="Users">
          {filteredUsers.map((user) => {
            const isSelected = selectedUserIds.includes(user.id)
            return (
              <li key={user.id} role="option" aria-selected={isSelected}>
                <button
                  className={`new-message-modal__user-item${isSelected ? ' new-message-modal__user-item--selected' : ''}`}
                  onClick={() => handleToggleUser(user.id)}
                >
                  <PresenceAvatar
                    name={user.displayName}
                    presence={user.presence}
                    size={32}
                  />
                  <div className="new-message-modal__user-info">
                    <span className="new-message-modal__user-name">{user.displayName}</span>
                    <span className="new-message-modal__user-email">{user.email}</span>
                  </div>
                  {isSelected && (
                    <Check size={16} className="new-message-modal__check" />
                  )}
                </button>
              </li>
            )
          })}
          {filteredUsers.length === 0 && (
            <li className="new-message-modal__empty">No users found</li>
          )}
        </ul>

        <div className="new-message-modal__footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={selectedUserIds.length === 0}
          >
            {selectedUserIds.length <= 1 ? 'Start Conversation' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  )
}
