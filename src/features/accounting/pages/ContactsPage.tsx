import { useState, useCallback, useMemo } from 'react'
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useAccountingContactStore } from '../stores/useAccountingContactStore'
import { useInvoiceStore } from '../stores/useInvoiceStore'
import { useExpenseStore } from '../stores/useExpenseStore'
import { CONTACT_TYPE_LABELS } from '../types'
import type { AccountingContact, ContactType } from '../types'
import { formatCurrency } from '../lib/formatCurrency'
import ContactForm from '../components/ContactForm/ContactForm'
import './ContactsPage.css'

type TypeFilter = 'all' | ContactType

function ContactsPage() {
  const contacts = useAccountingContactStore((s) => s.contacts)
  const deleteContact = useAccountingContactStore((s) => s.deleteContact)
  const invoices = useInvoiceStore((s) => s.invoices)
  const expenses = useExpenseStore((s) => s.expenses)

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<AccountingContact | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredContacts = useMemo(() => {
    let result = contacts
    if (typeFilter !== 'all') {
      result = result.filter(
        (c) => c.type === typeFilter || (typeFilter !== 'both' && c.type === 'both')
      )
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
    }
    return result
  }, [contacts, typeFilter, searchQuery])

  const handleAddContact = useCallback(() => {
    setEditingContact(null)
    setShowForm(true)
  }, [])

  const handleEditContact = useCallback((contact: AccountingContact) => {
    setEditingContact(contact)
    setShowForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingContact(null)
  }, [])

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const handleDeleteContact = useCallback(
    (id: string) => {
      deleteContact(id)
      setDeletingId(null)
      if (expandedId === id) setExpandedId(null)
    },
    [deleteContact, expandedId]
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  const getContactInvoices = useCallback(
    (contactId: string) => invoices.filter((inv) => inv.customerId === contactId),
    [invoices]
  )

  const getContactExpenses = useCallback(
    (contactId: string) => expenses.filter((exp) => exp.vendorId === contactId),
    [expenses]
  )

  const getTypeBadgeClass = (type: ContactType): string => {
    switch (type) {
      case 'customer':
        return 'contacts-page__type-badge--customer'
      case 'vendor':
        return 'contacts-page__type-badge--vendor'
      case 'both':
        return 'contacts-page__type-badge--both'
    }
  }

  const filterOptions: { label: string; value: TypeFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Customers', value: 'customer' },
    { label: 'Vendors', value: 'vendor' },
  ]

  return (
    <div className="contacts-page">
      <div className="contacts-page__header">
        <h1 className="contacts-page__title">Customers &amp; Vendors</h1>
        <button
          className="btn-primary contacts-page__add-btn"
          onClick={handleAddContact}
          type="button"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      <div className="contacts-page__filters">
        <div className="contacts-page__filter-pills">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              className={`contacts-page__filter-pill ${
                typeFilter === opt.value ? 'contacts-page__filter-pill--active' : ''
              }`}
              onClick={() => setTypeFilter(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="contacts-page__search">
          <Search size={16} className="contacts-page__search-icon" />
          <input
            type="text"
            className="contacts-page__search-input"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search contacts"
          />
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="contacts-page__empty">
          <Building2 size={48} />
          <p>No contacts found. Add your first customer or vendor.</p>
        </div>
      ) : (
        <div className="contacts-page__grid">
          {filteredContacts.map((contact) => {
            const isExpanded = expandedId === contact.id
            const isCustomer = contact.type === 'customer' || contact.type === 'both'
            const isVendor = contact.type === 'vendor' || contact.type === 'both'
            const contactInvoices = isExpanded && isCustomer ? getContactInvoices(contact.id) : []
            const contactExpenses = isExpanded && isVendor ? getContactExpenses(contact.id) : []

            return (
              <div
                key={contact.id}
                className={`contacts-page__card ${
                  isExpanded ? 'contacts-page__card--expanded' : ''
                }`}
              >
                <div
                  className="contacts-page__card-header"
                  onClick={() => handleToggleExpand(contact.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleToggleExpand(contact.id)
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-label={`Expand ${contact.name}`}
                >
                  <div className="contacts-page__card-expand">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div className="contacts-page__card-info">
                    <div className="contacts-page__card-name-row">
                      <span className="contacts-page__card-name">{contact.name}</span>
                      <span
                        className={`contacts-page__type-badge ${getTypeBadgeClass(contact.type)}`}
                      >
                        {CONTACT_TYPE_LABELS[contact.type]}
                      </span>
                    </div>
                    {contact.company && (
                      <div className="contacts-page__card-company">
                        <Building2 size={14} />
                        <span>{contact.company}</span>
                      </div>
                    )}
                    <div className="contacts-page__card-meta">
                      {contact.email && (
                        <span className="contacts-page__card-meta-item">
                          <Mail size={14} />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="contacts-page__card-meta-item">
                          <Phone size={14} />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="contacts-page__card-balance">
                    <span className="contacts-page__card-balance-label">Outstanding</span>
                    <span
                      className={`contacts-page__card-balance-value ${
                        contact.outstandingBalance > 0
                          ? 'contacts-page__card-balance-value--positive'
                          : ''
                      }`}
                    >
                      {formatCurrency(contact.outstandingBalance)}
                    </span>
                  </div>
                  <div className="contacts-page__card-actions">
                    <button
                      className="contacts-page__action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditContact(contact)
                      }}
                      type="button"
                      aria-label={`Edit ${contact.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    {deletingId === contact.id ? (
                      <div className="contacts-page__delete-confirm">
                        <button
                          className="contacts-page__delete-yes"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteContact(contact.id)
                          }}
                          type="button"
                        >
                          Delete
                        </button>
                        <button
                          className="contacts-page__delete-no"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingId(null)
                          }}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="contacts-page__action-btn contacts-page__action-btn--danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingId(contact.id)
                        }}
                        type="button"
                        aria-label={`Delete ${contact.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="contacts-page__card-detail">
                    {contact.address && (
                      <div className="contacts-page__detail-row">
                        <span className="contacts-page__detail-label">Address</span>
                        <span className="contacts-page__detail-value">{contact.address}</span>
                      </div>
                    )}

                    {isCustomer && contactInvoices.length > 0 && (
                      <div className="contacts-page__detail-section">
                        <h4 className="contacts-page__detail-heading">Related Invoices</h4>
                        <div className="contacts-page__detail-table">
                          {contactInvoices.map((inv) => (
                            <div key={inv.id} className="contacts-page__detail-table-row">
                              <span className="contacts-page__detail-table-cell">
                                {inv.invoiceNumber}
                              </span>
                              <span className="contacts-page__detail-table-cell">
                                {formatCurrency(inv.total)}
                              </span>
                              <span
                                className={`contacts-page__invoice-status contacts-page__invoice-status--${inv.status}`}
                              >
                                {inv.status.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isVendor && contactExpenses.length > 0 && (
                      <div className="contacts-page__detail-section">
                        <h4 className="contacts-page__detail-heading">Recent Expenses</h4>
                        <div className="contacts-page__detail-table">
                          {contactExpenses.map((exp) => (
                            <div key={exp.id} className="contacts-page__detail-table-row">
                              <span className="contacts-page__detail-table-cell">
                                {exp.description}
                              </span>
                              <span className="contacts-page__detail-table-cell">
                                {formatCurrency(exp.amount)}
                              </span>
                              <span className="contacts-page__detail-table-cell contacts-page__detail-table-cell--muted">
                                {exp.date}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isCustomer && contactInvoices.length === 0 && (
                      <p className="contacts-page__detail-empty">No invoices for this customer.</p>
                    )}
                    {isVendor && contactExpenses.length === 0 && (
                      <p className="contacts-page__detail-empty">No expenses for this vendor.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && <ContactForm contact={editingContact ?? undefined} onClose={handleCloseForm} />}
    </div>
  )
}

export default ContactsPage
