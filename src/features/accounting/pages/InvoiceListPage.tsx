import { useState, useCallback, useMemo } from 'react'
import { Plus, Send, DollarSign, Eye, XCircle, Trash2, Pencil, Upload } from 'lucide-react'
import { useInvoiceStore } from '../stores/useInvoiceStore'
import { useAccountingContactStore } from '../stores/useAccountingContactStore'
import { formatCurrency } from '../lib/formatCurrency'
import { ACC_INVOICE_STATUS_LABELS, AccInvoiceStatus } from '../types'
import type { Invoice, AccInvoiceStatus as AccInvoiceStatusType } from '../types'
import InvoiceBuilder from '../components/InvoiceBuilder/InvoiceBuilder'
import PaymentModal from '../components/PaymentModal/PaymentModal'
import BulkImportModal from '../../../components/BulkImportModal/BulkImportModal'
import { createInvoiceImportConfig } from '../../../lib/importConfigs'
import './InvoiceListPage.css'

type FilterValue = 'all' | AccInvoiceStatusType

const STATUS_FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: AccInvoiceStatus.Draft, label: 'Draft' },
  { value: AccInvoiceStatus.Sent, label: 'Sent' },
  { value: AccInvoiceStatus.Paid, label: 'Paid' },
  { value: AccInvoiceStatus.Overdue, label: 'Overdue' },
  { value: AccInvoiceStatus.Void, label: 'Void' },
]

function getStatusClass(status: AccInvoiceStatusType): string {
  switch (status) {
    case 'draft': return 'invoice-list__status--draft'
    case 'sent': return 'invoice-list__status--sent'
    case 'viewed': return 'invoice-list__status--viewed'
    case 'paid': return 'invoice-list__status--paid'
    case 'partially_paid': return 'invoice-list__status--partial'
    case 'overdue': return 'invoice-list__status--overdue'
    case 'void': return 'invoice-list__status--void'
    default: return ''
  }
}

function InvoiceListPage() {
  const invoices = useInvoiceStore((s) => s.invoices)
  const deleteInvoice = useInvoiceStore((s) => s.deleteInvoice)
  const sendInvoice = useInvoiceStore((s) => s.sendInvoice)
  const voidInvoice = useInvoiceStore((s) => s.voidInvoice)
  const getOutstandingTotal = useInvoiceStore((s) => s.getOutstandingTotal)
  const getOverdueTotal = useInvoiceStore((s) => s.getOverdueTotal)
  useAccountingContactStore((s) => s.contacts)
  const importInvoices = useInvoiceStore((s) => s.importInvoices)

  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')
  const [showBuilder, setShowBuilder] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)

  const filteredInvoices = useMemo(() => {
    if (activeFilter === 'all') return invoices
    return invoices.filter((inv) => inv.status === activeFilter)
  }, [invoices, activeFilter])

  const outstandingTotal = useMemo(() => getOutstandingTotal(), [getOutstandingTotal])
  const overdueTotal = useMemo(() => getOverdueTotal(), [getOverdueTotal])

  const handleNewInvoice = useCallback(() => {
    setEditingInvoice(null)
    setShowBuilder(true)
  }, [])

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    setEditingInvoice(invoice)
    setShowBuilder(true)
  }, [])

  const handleCloseBuilder = useCallback(() => {
    setShowBuilder(false)
    setEditingInvoice(null)
  }, [])

  const handleRecordPayment = useCallback((invoice: Invoice) => {
    setPaymentInvoice(invoice)
  }, [])

  const handleClosePayment = useCallback(() => {
    setPaymentInvoice(null)
  }, [])

  const handleSend = useCallback((id: string) => {
    sendInvoice(id)
  }, [sendInvoice])

  const handleVoid = useCallback((id: string) => {
    voidInvoice(id)
  }, [voidInvoice])

  const handleDelete = useCallback((id: string) => {
    deleteInvoice(id)
  }, [deleteInvoice])

  const canRecordPayment = (status: AccInvoiceStatusType) =>
    status === 'sent' || status === 'partially_paid' || status === 'overdue'

  return (
    <div className="invoice-list">
      {/* Header */}
      <div className="invoice-list__header">
        <h1 className="invoice-list__title">Invoicing</h1>
        <button
          className="btn-primary invoice-list__new-btn"
          onClick={handleNewInvoice}
          type="button"
        >
          <Plus size={16} />
          New Invoice
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowImport(true)}
          type="button"
        >
          <Upload size={16} />
          Import CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="invoice-list__summary">
        <div className="invoice-list__summary-card">
          <div className="invoice-list__summary-icon invoice-list__summary-icon--outstanding">
            <DollarSign size={20} />
          </div>
          <div className="invoice-list__summary-body">
            <span className="invoice-list__summary-label">Total Outstanding</span>
            <span className="invoice-list__summary-value">{formatCurrency(outstandingTotal)}</span>
          </div>
        </div>
        <div className="invoice-list__summary-card">
          <div className="invoice-list__summary-icon invoice-list__summary-icon--overdue">
            <DollarSign size={20} />
          </div>
          <div className="invoice-list__summary-body">
            <span className="invoice-list__summary-label">Total Overdue</span>
            <span className="invoice-list__summary-value invoice-list__summary-value--danger">
              {formatCurrency(overdueTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="invoice-list__filters" role="tablist" aria-label="Invoice status filters">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            className={`invoice-list__filter-pill${activeFilter === filter.value ? ' invoice-list__filter-pill--active' : ''}`}
            onClick={() => setActiveFilter(filter.value)}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter.value}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="invoice-list__table-wrapper">
        <table className="invoice-list__table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="invoice-list__empty">
                  No invoices found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-list__cell--number">{invoice.invoiceNumber}</td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.issueDate}</td>
                  <td>{invoice.dueDate}</td>
                  <td className="invoice-list__cell--amount">{formatCurrency(invoice.total)}</td>
                  <td className="invoice-list__cell--amount">{formatCurrency(invoice.balance)}</td>
                  <td>
                    <span className={`invoice-list__status ${getStatusClass(invoice.status)}`}>
                      {ACC_INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </td>
                  <td>
                    <div className="invoice-list__actions">
                      {invoice.status === 'draft' && (
                        <>
                          <button
                            className="invoice-list__action-btn"
                            onClick={() => handleEditInvoice(invoice)}
                            title="Edit"
                            type="button"
                            aria-label={`Edit ${invoice.invoiceNumber}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="invoice-list__action-btn invoice-list__action-btn--send"
                            onClick={() => handleSend(invoice.id)}
                            title="Send"
                            type="button"
                            aria-label={`Send ${invoice.invoiceNumber}`}
                          >
                            <Send size={14} />
                          </button>
                        </>
                      )}
                      {canRecordPayment(invoice.status) && (
                        <button
                          className="invoice-list__action-btn invoice-list__action-btn--payment"
                          onClick={() => handleRecordPayment(invoice)}
                          title="Record Payment"
                          type="button"
                          aria-label={`Record payment for ${invoice.invoiceNumber}`}
                        >
                          <DollarSign size={14} />
                        </button>
                      )}
                      <button
                        className="invoice-list__action-btn"
                        onClick={() => handleEditInvoice(invoice)}
                        title="View"
                        type="button"
                        aria-label={`View ${invoice.invoiceNumber}`}
                      >
                        <Eye size={14} />
                      </button>
                      {invoice.status !== 'void' && (
                        <button
                          className="invoice-list__action-btn invoice-list__action-btn--void"
                          onClick={() => handleVoid(invoice.id)}
                          title="Void"
                          type="button"
                          aria-label={`Void ${invoice.invoiceNumber}`}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      <button
                        className="invoice-list__action-btn invoice-list__action-btn--delete"
                        onClick={() => handleDelete(invoice.id)}
                        title="Delete"
                        type="button"
                        aria-label={`Delete ${invoice.invoiceNumber}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Builder Modal */}
      {showBuilder && (
        <InvoiceBuilder invoice={editingInvoice ?? undefined} onClose={handleCloseBuilder} />
      )}

      {/* Payment Modal */}
      {paymentInvoice && (
        <PaymentModal invoice={paymentInvoice} onClose={handleClosePayment} />
      )}

      {showImport && (
        <BulkImportModal
          config={createInvoiceImportConfig()}
          onImport={(items) => importInvoices(items as Parameters<typeof importInvoices>[0])}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  )
}

export default InvoiceListPage
