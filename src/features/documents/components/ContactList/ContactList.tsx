import { useState, useCallback, useMemo } from 'react'
import type { Contact } from '../../../../types'
import './ContactList.css'

interface ContactListProps {
  contacts: Contact[]
  onSelect: (contact: Contact) => void
  onDelete?: (id: string) => void
  selectedId?: string
  searchQuery?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function ContactList({
  contacts,
  onSelect,
  onDelete,
  selectedId,
  searchQuery: externalQuery,
}: ContactListProps) {
  const [internalQuery, setInternalQuery] = useState('')
  const query = externalQuery ?? internalQuery

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return contacts
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    )
  }, [contacts, query])

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      onDelete?.(id)
    },
    [onDelete]
  )

  return (
    <div className="contact-list">
      {externalQuery === undefined && (
        <input
          type="text"
          className="contact-list__search"
          placeholder="Search contacts..."
          value={internalQuery}
          onChange={(e) => setInternalQuery(e.target.value)}
          aria-label="Search contacts"
        />
      )}

      <div className="contact-list__items" role="listbox" aria-label="Contacts">
        {filtered.length === 0 ? (
          <div className="contact-list__empty">
            {query ? 'No contacts match your search' : 'No contacts yet'}
          </div>
        ) : (
          filtered.map((contact) => (
            <div
              key={contact.id}
              className={`contact-list__item ${contact.id === selectedId ? 'contact-list__item--selected' : ''}`}
              onClick={() => onSelect(contact)}
              role="option"
              aria-selected={contact.id === selectedId}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(contact)
                }
              }}
            >
              <div className="contact-list__avatar" aria-hidden="true">
                {getInitials(contact.name)}
              </div>
              <div className="contact-list__info">
                <span className="contact-list__name">{contact.name}</span>
                <span className="contact-list__email">{contact.email}</span>
                {contact.company && (
                  <span className="contact-list__company">{contact.company}</span>
                )}
              </div>
              {onDelete && (
                <button
                  className="contact-list__delete"
                  onClick={(e) => handleDelete(e, contact.id)}
                  aria-label={`Delete ${contact.name}`}
                >
                  &times;
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ContactList
