import { useState, useCallback } from 'react'
import { usePayrollStore } from '../../stores/usePayrollStore'
import {
  PayFrequency,
  PAY_FREQUENCY_LABELS,
  EmployeeStatus,
  EMPLOYEE_STATUS_LABELS,
} from '../../types'
import type { Employee } from '../../types'
import './EmployeeForm.css'

interface EmployeeFormProps {
  employee?: Employee
  onClose: () => void
}

function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const addEmployee = usePayrollStore((s) => s.addEmployee)
  const updateEmployee = usePayrollStore((s) => s.updateEmployee)

  const [firstName, setFirstName] = useState(employee?.firstName ?? '')
  const [lastName, setLastName] = useState(employee?.lastName ?? '')
  const [email, setEmail] = useState(employee?.email ?? '')
  const [phone, setPhone] = useState(employee?.phone ?? '')
  const [title, setTitle] = useState(employee?.title ?? '')
  const [department, setDepartment] = useState(employee?.department ?? '')
  const [startDate, setStartDate] = useState(employee?.startDate ?? '')
  const [status, setStatus] = useState<string>(
    employee?.status ?? EmployeeStatus.Active
  )
  const [payRate, setPayRate] = useState(
    employee ? String(employee.payRate) : ''
  )
  const [payFrequency, setPayFrequency] = useState<string>(
    employee?.payFrequency ?? PayFrequency.Monthly
  )
  const [federalWithholding, setFederalWithholding] = useState(
    employee ? String(Math.round(employee.federalWithholding * 100)) : '22'
  )
  const [stateWithholding, setStateWithholding] = useState(
    employee ? String(Math.round(employee.stateWithholding * 100)) : '5'
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        title: title.trim(),
        department: department.trim(),
        startDate,
        status: status as Employee['status'],
        payRate: parseFloat(payRate) || 0,
        payFrequency: payFrequency as Employee['payFrequency'],
        federalWithholding: (parseFloat(federalWithholding) || 0) / 100,
        stateWithholding: (parseFloat(stateWithholding) || 0) / 100,
      }

      if (employee) {
        updateEmployee(employee.id, data)
      } else {
        addEmployee(data)
      }

      onClose()
    },
    [
      firstName,
      lastName,
      email,
      phone,
      title,
      department,
      startDate,
      status,
      payRate,
      payFrequency,
      federalWithholding,
      stateWithholding,
      employee,
      addEmployee,
      updateEmployee,
      onClose,
    ]
  )

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div className="employee-form" role="dialog" aria-label={employee ? 'Edit Employee' : 'Add Employee'}>
        <div className="employee-form__header">
          <h2 className="employee-form__title">
            {employee ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button
            className="employee-form__close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="employee-form__body">
          {/* Personal Information */}
          <fieldset className="employee-form__fieldset">
            <legend className="employee-form__legend">
              Personal Information
            </legend>
            <div className="employee-form__grid">
              <label className="employee-form__field">
                <span className="employee-form__label">First Name</span>
                <input
                  className="employee-form__input"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">Last Name</span>
                <input
                  className="employee-form__input"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">Email</span>
                <input
                  className="employee-form__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">Phone</span>
                <input
                  className="employee-form__input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          {/* Employment */}
          <fieldset className="employee-form__fieldset">
            <legend className="employee-form__legend">Employment</legend>
            <div className="employee-form__grid">
              <label className="employee-form__field">
                <span className="employee-form__label">Title</span>
                <input
                  className="employee-form__input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">Department</span>
                <input
                  className="employee-form__input"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">Start Date</span>
                <input
                  className="employee-form__input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">Status</span>
                <select
                  className="employee-form__input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {Object.entries(EMPLOYEE_STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          {/* Compensation */}
          <fieldset className="employee-form__fieldset">
            <legend className="employee-form__legend">Compensation</legend>
            <div className="employee-form__grid">
              <label className="employee-form__field">
                <span className="employee-form__label">Pay Rate ($/yr)</span>
                <input
                  className="employee-form__input"
                  type="number"
                  min="0"
                  step="1000"
                  value={payRate}
                  onChange={(e) => setPayRate(e.target.value)}
                  required
                />
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">Pay Frequency</span>
                <select
                  className="employee-form__input"
                  value={payFrequency}
                  onChange={(e) => setPayFrequency(e.target.value)}
                >
                  {Object.entries(PAY_FREQUENCY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">
                  Federal Withholding %
                </span>
                <input
                  className="employee-form__input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={federalWithholding}
                  onChange={(e) => setFederalWithholding(e.target.value)}
                />
              </label>
              <label className="employee-form__field">
                <span className="employee-form__label">
                  State Withholding %
                </span>
                <input
                  className="employee-form__input"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={stateWithholding}
                  onChange={(e) => setStateWithholding(e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          {/* Buttons */}
          <div className="employee-form__footer">
            <button className="btn-secondary" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="btn-primary" type="submit">
              {employee ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeForm
