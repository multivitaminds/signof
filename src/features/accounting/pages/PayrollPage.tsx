import { useState, useCallback } from 'react'
import { Plus, Play, Eye, Pencil, Trash2, Upload } from 'lucide-react'
import { usePayrollStore } from '../stores/usePayrollStore'
import {
  EMPLOYEE_STATUS_LABELS,
  PAYROLL_STATUS_LABELS,
  PAY_FREQUENCY_LABELS,
} from '../types'
import type { Employee, PayRun } from '../types'
import { formatCurrency } from '../lib/formatCurrency'
import EmployeeForm from '../components/EmployeeForm/EmployeeForm'
import PayRunWizard from '../components/PayRunWizard/PayRunWizard'
import PayStubModal from '../components/PayStubModal/PayStubModal'
import BulkImportModal from '../../../components/BulkImportModal/BulkImportModal'
import { createEmployeeImportConfig } from '../../../lib/importConfigs'
import './PayrollPage.css'

function PayrollPage() {
  const employees = usePayrollStore((s) => s.employees)
  const payRuns = usePayrollStore((s) => s.payRuns)
  const deleteEmployee = usePayrollStore((s) => s.deleteEmployee)
  const importEmployees = usePayrollStore((s) => s.importEmployees)

  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [viewingPayRun, setViewingPayRun] = useState<PayRun | null>(null)

  const handleAddEmployee = useCallback(() => {
    setEditingEmployee(null)
    setShowEmployeeForm(true)
  }, [])

  const handleEditEmployee = useCallback((employee: Employee) => {
    setEditingEmployee(employee)
    setShowEmployeeForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowEmployeeForm(false)
    setEditingEmployee(null)
  }, [])

  const handleRunPayroll = useCallback(() => {
    setShowWizard(true)
  }, [])

  const handleCloseWizard = useCallback(() => {
    setShowWizard(false)
  }, [])

  const handleViewStubs = useCallback((payRun: PayRun) => {
    setViewingPayRun(payRun)
  }, [])

  const handleCloseStubs = useCallback(() => {
    setViewingPayRun(null)
  }, [])

  const handleDeleteEmployee = useCallback(
    (id: string) => {
      deleteEmployee(id)
    },
    [deleteEmployee]
  )

  const statusClass = (status: string): string => {
    switch (status) {
      case 'active':
        return 'payroll-page__badge--success'
      case 'inactive':
        return 'payroll-page__badge--warning'
      case 'terminated':
        return 'payroll-page__badge--danger'
      case 'draft':
        return 'payroll-page__badge--muted'
      case 'processing':
        return 'payroll-page__badge--info payroll-page__badge--animated'
      case 'completed':
        return 'payroll-page__badge--success'
      case 'failed':
        return 'payroll-page__badge--danger'
      default:
        return ''
    }
  }

  const sortedPayRuns = [...payRuns].sort(
    (a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime()
  )

  return (
    <div className="payroll-page">
      {/* Header */}
      <div className="payroll-page__header">
        <h1 className="payroll-page__title">Payroll</h1>
        <div className="payroll-page__actions">
          <button
            className="btn-primary"
            onClick={handleRunPayroll}
            type="button"
          >
            <Play size={16} />
            Run Payroll
          </button>
          <button
            className="btn-secondary"
            onClick={handleAddEmployee}
            type="button"
          >
            <Plus size={16} />
            Add Employee
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
      </div>

      {/* Employees Table */}
      <div className="payroll-page__section">
        <h2 className="payroll-page__section-title">Employees</h2>
        {employees.length === 0 ? (
          <p className="payroll-page__empty">
            No employees yet. Add your first employee to get started.
          </p>
        ) : (
          <div className="payroll-page__table-wrapper">
            <table className="payroll-page__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Pay Rate</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="payroll-page__cell--name">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td>{emp.title}</td>
                    <td>{formatCurrency(emp.payRate)}/yr</td>
                    <td>{PAY_FREQUENCY_LABELS[emp.payFrequency]}</td>
                    <td>
                      <span
                        className={`payroll-page__badge ${statusClass(emp.status)}`}
                      >
                        {EMPLOYEE_STATUS_LABELS[emp.status]}
                      </span>
                    </td>
                    <td>
                      <div className="payroll-page__row-actions">
                        <button
                          className="payroll-page__icon-btn"
                          onClick={() => handleEditEmployee(emp)}
                          type="button"
                          aria-label={`Edit ${emp.firstName} ${emp.lastName}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="payroll-page__icon-btn payroll-page__icon-btn--danger"
                          onClick={() => handleDeleteEmployee(emp.id)}
                          type="button"
                          aria-label={`Delete ${emp.firstName} ${emp.lastName}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="payroll-page__divider" />

      {/* Pay Run History */}
      <div className="payroll-page__section">
        <h2 className="payroll-page__section-title">Pay Run History</h2>
        {sortedPayRuns.length === 0 ? (
          <p className="payroll-page__empty">
            No pay runs yet. Run your first payroll above.
          </p>
        ) : (
          <div className="payroll-page__table-wrapper">
            <table className="payroll-page__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employees</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayRuns.map((pr) => (
                  <tr key={pr.id}>
                    <td>{new Date(pr.payDate).toLocaleDateString()}</td>
                    <td>{pr.employeeCount}</td>
                    <td>{formatCurrency(pr.totalNet)}</td>
                    <td>
                      <span
                        className={`payroll-page__badge ${statusClass(pr.status)}`}
                      >
                        {PAYROLL_STATUS_LABELS[pr.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="payroll-page__view-btn"
                        onClick={() => handleViewStubs(pr)}
                        type="button"
                        aria-label={`View stubs for ${pr.payDate}`}
                      >
                        <Eye size={14} />
                        View Stubs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEmployeeForm && (
        <EmployeeForm
          employee={editingEmployee ?? undefined}
          onClose={handleCloseForm}
        />
      )}

      {showWizard && <PayRunWizard onClose={handleCloseWizard} />}

      {viewingPayRun && (
        <PayStubModal payRun={viewingPayRun} onClose={handleCloseStubs} />
      )}

      {showImport && (
        <BulkImportModal
          config={createEmployeeImportConfig()}
          onImport={(items) => importEmployees(items as Parameters<typeof importEmployees>[0])}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  )
}

export default PayrollPage
