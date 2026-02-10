import { useState, useCallback } from 'react'
import type { Document } from '../../types'
import './AddSigners.css'

interface AddSignersProps {
  document: Document
  onSend: () => void
  onSaveDraft: () => void
  onAddSigner: (name: string, email: string) => void
  onRemoveSigner: (signerId: string) => void
}

function AddSigners({ document, onSend, onSaveDraft, onAddSigner, onRemoveSigner }: AddSignersProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAddSigner = useCallback(() => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setError(null)
    onAddSigner(name.trim(), email.trim())
    setName('')
    setEmail('')
  }, [name, email, onAddSigner])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddSigner()
      }
    },
    [handleAddSigner]
  )

  return (
    <div className="add-signers" role="region" aria-label="Add signers">
      <div className="add-signers__header">
        <h2>{document.name}</h2>
      </div>

      <div className="add-signers__form">
        <div className="add-signers__input-group">
          <input
            type="text"
            className="add-signers__input"
            placeholder="Signer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Signer name"
          />
          <input
            type="email"
            className="add-signers__input"
            placeholder="Signer email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Signer email"
          />
          <button
            className="btn-primary add-signers__add-btn"
            onClick={handleAddSigner}
            type="button"
          >
            Add Signer
          </button>
        </div>

        {error && (
          <p className="add-signers__error" role="alert">
            {error}
          </p>
        )}
      </div>

      {document.signers.length > 0 && (
        <ul className="add-signers__signer-list" aria-label="Current signers">
          {document.signers.map((signer) => (
            <li key={signer.id} className="add-signers__signer">
              <div className="add-signers__signer-info">
                <span className="add-signers__signer-name">{signer.name}</span>
                <span className="add-signers__signer-email">{signer.email}</span>
              </div>
              <button
                className="btn-ghost add-signers__remove-btn"
                onClick={() => onRemoveSigner(signer.id)}
                aria-label={`Remove ${signer.name}`}
                type="button"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="add-signers__actions">
        <button
          className="btn-primary"
          onClick={onSend}
          disabled={document.signers.length === 0}
          type="button"
        >
          Send Document
        </button>
        <button
          className="btn-secondary"
          onClick={onSaveDraft}
          type="button"
        >
          Save as Draft
        </button>
      </div>
    </div>
  )
}

export default AddSigners
