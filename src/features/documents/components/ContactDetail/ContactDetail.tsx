import { useState, useCallback } from 'react'
import type { Contact } from '../../../../types'
import './ContactDetail.css'

interface ContactDetailProps {
  contact: Contact
  onEdit: (updates: Partial<Contact>) => void
  onClose: () => void
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

function ContactDetail({ contact, onEdit, onClose }: ContactDetailProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(contact.name)
  const [email, setEmail] = useState(contact.email)
  const [company, setCompany] = useState(contact.company ?? '')
  const [phone, setPhone] = useState(contact.phone ?? '')

  const handleSave = useCallback(() => {
    onEdit({
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
    })
    setEditing(false)
  }, [name, email, company, phone, onEdit])

  const handleCancel = useCallback(() => {
    setName(contact.name)
    setEmail(contact.email)
    setCompany(contact.company ?? '')
    setPhone(contact.phone ?? '')
    setEditing(false)
  }, [contact])

  return (
    <div className="contact-detail">
      <div className="contact-detail__header">
        <div className="contact-detail__avatar" aria-hidden="true">
          {getInitials(contact.name)}
        </div>
        <div className="contact-detail__header-actions">
          {!editing && (
            <button
              className="btn-secondary"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close contact detail"
          >
            &times;
          </button>
        </div>
      </div>

      <div className="contact-detail__fields">
        <div className="contact-detail__field">
          <label className="contact-detail__label">Name</label>
          {editing ? (
            <input
              type="text"
              className="contact-detail__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Contact name"
            />
          ) : (
            <span className="contact-detail__value">{contact.name}</span>
          )}
        </div>

        <div className="contact-detail__field">
          <label className="contact-detail__label">Email</label>
          {editing ? (
            <input
              type="email"
              className="contact-detail__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Contact email"
            />
          ) : (
            <span className="contact-detail__value">{contact.email}</span>
          )}
        </div>

        <div className="contact-detail__field">
          <label className="contact-detail__label">Company</label>
          {editing ? (
            <input
              type="text"
              className="contact-detail__input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-label="Contact company"
            />
          ) : (
            <span className="contact-detail__value">
              {contact.company || '--'}
            </span>
          )}
        </div>

        <div className="contact-detail__field">
          <label className="contact-detail__label">Phone</label>
          {editing ? (
            <input
              type="tel"
              className="contact-detail__input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="Contact phone"
            />
          ) : (
            <span className="contact-detail__value">
              {contact.phone || '--'}
            </span>
          )}
        </div>

        {editing && (
          <div className="contact-detail__edit-actions">
            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="contact-detail__history">
        <h4 className="contact-detail__history-title">Signing History</h4>
        {contact.signingHistory.length === 0 ? (
          <p className="contact-detail__history-empty">No signing history</p>
        ) : (
          <ul className="contact-detail__history-list">
            {contact.signingHistory.map((entry, idx) => (
              <li key={idx} className="contact-detail__history-item">
                <span className="contact-detail__history-doc">
                  Document: {entry.documentId}
                </span>
                <span className="contact-detail__history-date">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <span
                  className={`contact-detail__history-status contact-detail__history-status--${entry.status}`}
                >
                  {entry.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ContactDetail
