import { useState, useCallback, useMemo } from 'react'
import type { Contact } from '../../../../types'
import './ContactPicker.css'

interface ContactPickerProps {
  contacts: Contact[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onAddNew?: (name: string, email: string) => void
}

function ContactPicker({
  contacts,
  selectedIds,
  onChange,
  onAddNew,
}: ContactPickerProps) {
  const [search, setSearch] = useState('')
  const [showAddNew, setShowAddNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return contacts
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    )
  }, [contacts, search])

  const selectedContacts = useMemo(
    () => contacts.filter((c) => selectedIds.includes(c.id)),
    [contacts, selectedIds]
  )

  const handleToggle = useCallback(
    (contactId: string) => {
      if (selectedIds.includes(contactId)) {
        onChange(selectedIds.filter((id) => id !== contactId))
      } else {
        onChange([...selectedIds, contactId])
      }
    },
    [selectedIds, onChange]
  )

  const handleRemoveChip = useCallback(
    (contactId: string) => {
      onChange(selectedIds.filter((id) => id !== contactId))
    },
    [selectedIds, onChange]
  )

  const handleAddNew = useCallback(() => {
    const trimmedName = newName.trim()
    const trimmedEmail = newEmail.trim()
    if (trimmedName && trimmedEmail && onAddNew) {
      onAddNew(trimmedName, trimmedEmail)
      setNewName('')
      setNewEmail('')
      setShowAddNew(false)
    }
  }, [newName, newEmail, onAddNew])

  return (
    <div className="contact-picker">
      {selectedContacts.length > 0 && (
        <div className="contact-picker__chips" role="list" aria-label="Selected contacts">
          {selectedContacts.map((contact) => (
            <span key={contact.id} className="contact-picker__chip" role="listitem">
              {contact.name}
              <button
                className="contact-picker__chip-remove"
                onClick={() => handleRemoveChip(contact.id)}
                aria-label={`Remove ${contact.name}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        className="contact-picker__search"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search contacts"
      />

      <div className="contact-picker__list" role="listbox" aria-label="Contact options">
        {filtered.map((contact) => (
          <label
            key={contact.id}
            className={`contact-picker__option ${selectedIds.includes(contact.id) ? 'contact-picker__option--selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(contact.id)}
              onChange={() => handleToggle(contact.id)}
              aria-label={contact.name}
            />
            <span className="contact-picker__option-info">
              <span className="contact-picker__option-name">{contact.name}</span>
              <span className="contact-picker__option-email">{contact.email}</span>
            </span>
          </label>
        ))}

        {filtered.length === 0 && (
          <div className="contact-picker__empty">No contacts found</div>
        )}
      </div>

      {onAddNew && (
        <div className="contact-picker__add-new">
          {showAddNew ? (
            <div className="contact-picker__add-new-form">
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="contact-picker__add-new-input"
                aria-label="New contact name"
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="contact-picker__add-new-input"
                aria-label="New contact email"
              />
              <div className="contact-picker__add-new-actions">
                <button
                  className="btn-primary"
                  onClick={handleAddNew}
                  disabled={!newName.trim() || !newEmail.trim()}
                >
                  Add
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowAddNew(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="contact-picker__add-new-btn"
              onClick={() => setShowAddNew(true)}
            >
              + Add new contact
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ContactPicker
