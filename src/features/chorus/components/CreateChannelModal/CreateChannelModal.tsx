import { useState, useCallback } from 'react'
import { X, Hash, Lock } from 'lucide-react'
import { useChorusStore } from '../../stores/useChorusStore'
import { ChorusChannelType } from '../../types'
import './CreateChannelModal.css'

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateChannelModal({ isOpen, onClose }: CreateChannelModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const createChannel = useChorusStore((s) => s.createChannel)
  const currentUserId = useChorusStore((s) => s.currentUserId)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const channelName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      if (!channelName) return

      createChannel(
        channelName,
        description.trim(),
        isPrivate ? ChorusChannelType.Private : ChorusChannelType.Public,
        currentUserId
      )

      setName('')
      setDescription('')
      setIsPrivate(false)
      onClose()
    },
    [name, description, isPrivate, createChannel, currentUserId, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  if (!isOpen) return null

  const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Create channel"
    >
      <div
        className="modal-content create-channel-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Create a Channel</h2>
          <button className="modal-header__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-channel-modal__form">
          <div className="create-channel-modal__field">
            <label htmlFor="channel-name" className="create-channel-modal__label">
              Name
            </label>
            <div className="create-channel-modal__name-input">
              <span className="create-channel-modal__prefix">
                {isPrivate ? <Lock size={16} /> : <Hash size={16} />}
              </span>
              <input
                id="channel-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. project-alpha"
                className="create-channel-modal__input"
                maxLength={80}
                autoFocus
              />
            </div>
            {sanitizedName && sanitizedName !== name.trim() && (
              <span className="create-channel-modal__hint">
                Channel will be created as <strong>#{sanitizedName}</strong>
              </span>
            )}
          </div>

          <div className="create-channel-modal__field">
            <label htmlFor="channel-desc" className="create-channel-modal__label">
              Description <span className="create-channel-modal__optional">(optional)</span>
            </label>
            <textarea
              id="channel-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="create-channel-modal__textarea"
              rows={3}
              maxLength={250}
            />
          </div>

          <div className="create-channel-modal__field">
            <label className="create-channel-modal__toggle-row">
              <span className="create-channel-modal__toggle-label">
                <Lock size={16} />
                Make private
              </span>
              <span className="create-channel-modal__toggle-desc">
                Only invited members can see and join this channel
              </span>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="create-channel-modal__checkbox"
              />
            </label>
          </div>

          <div className="create-channel-modal__actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!sanitizedName}
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
