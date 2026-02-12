import { useState, useCallback } from 'react'
import { useAccountingContactStore } from '../../stores/useAccountingContactStore'
import type { AccountingContact, ContactType } from '../../types'
import './ContactForm.css'

interface ContactFormProps {
  contact?: AccountingContact
  onClose: () => void
}

function ContactForm({ contact, onClose }: ContactFormProps) {
  const addContact = useAccountingContactStore((s) => s.addContact)
  const updateContact = useAccountingContactStore((s) => s.updateContact)

  const [name, setName] = useState(contact?.name ?? '')
  const [email, setEmail] = useState(contact?.email ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [company, setCompany] = useState(contact?.company ?? '')
  const [type, setType] = useState<ContactType>(contact?.type ?? 'customer')
  const [address, setAddress] = useState(contact?.address ?? '')

  const isEditing = !!contact

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim()) return

      if (isEditing && contact) {
        updateContact(contact.id, { name: name.trim(), email, phone, company, type, address })
      } else {
        addContact({
          name: name.trim(),
          email,
          phone,
          company,
          type,
          address,
          outstandingBalance: 0,
        })
      }
      onClose()
    },
    [name, email, phone, company, type, address, isEditing, contact, addContact, updateContact, onClose]
  )

  const typeOptions: { label: string; value: ContactType }[] = [
    { label: 'Customer', value: 'customer' },
    { label: 'Vendor', value: 'vendor' },
    { label: 'Both', value: 'both' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content contact-form"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={isEditing ? 'Edit Contact' : 'Add Contact'}
      >
        <div className="modal-header">
          <h2 className="contact-form__title">
            {isEditing ? 'Edit Contact' : 'New Contact'}
          </h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            &times;
          </button>
        </div>

        <form className="contact-form__body" onSubmit={handleSubmit}>
          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="contact-name">
              Name <span className="contact-form__required">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              className="contact-form__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              autoFocus
            />
          </div>

          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              className="contact-form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="contact-phone">Phone</label>
            <input
              id="contact-phone"
              type="tel"
              className="contact-form__input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
            />
          </div>

          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="contact-company">Company</label>
            <input
              id="contact-company"
              type="text"
              className="contact-form__input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
            />
          </div>

          <div className="contact-form__field">
            <label className="contact-form__label">Type</label>
            <div className="contact-form__segmented" role="radiogroup" aria-label="Contact type">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`contact-form__segment ${
                    type === opt.value ? 'contact-form__segment--active' : ''
                  }`}
                  onClick={() => setType(opt.value)}
                  role="radio"
                  aria-checked={type === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="contact-address">Address</label>
            <textarea
              id="contact-address"
              className="contact-form__textarea"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State ZIP"
              rows={3}
            />
          </div>

          <div className="contact-form__actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContactForm
