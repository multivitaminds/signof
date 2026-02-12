import { render, screen } from '@testing-library/react'
import EmployeeForm from './EmployeeForm'

vi.mock('../../stores/usePayrollStore', () => ({
  usePayrollStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      addEmployee: vi.fn(),
      updateEmployee: vi.fn(),
    }),
}))

describe('EmployeeForm', () => {
  it('renders the Add Employee title when no employee prop', () => {
    render(<EmployeeForm onClose={vi.fn()} />)
    expect(
      screen.getByRole('dialog', { name: 'Add Employee' })
    ).toBeInTheDocument()
  })

  it('renders Personal Information section', () => {
    render(<EmployeeForm onClose={vi.fn()} />)
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByText('Last Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
  })

  it('renders Employment section', () => {
    render(<EmployeeForm onClose={vi.fn()} />)
    expect(screen.getByText('Employment')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders Compensation section with withholding fields', () => {
    render(<EmployeeForm onClose={vi.fn()} />)
    expect(screen.getByText('Compensation')).toBeInTheDocument()
    expect(screen.getByText('Pay Rate ($/yr)')).toBeInTheDocument()
    expect(screen.getByText('Pay Frequency')).toBeInTheDocument()
    expect(screen.getByText('Federal Withholding %')).toBeInTheDocument()
    expect(screen.getByText('State Withholding %')).toBeInTheDocument()
  })

  it('renders Save/Cancel buttons', () => {
    render(<EmployeeForm onClose={vi.fn()} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Employee' })).toBeInTheDocument()
  })

  it('renders Edit Employee title when employee prop provided', () => {
    const employee = {
      id: 'emp-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@co.com',
      phone: '(555) 111-1111',
      title: 'Manager',
      department: 'Engineering',
      startDate: '2024-03-15',
      status: 'active' as const,
      payRate: 120000,
      payFrequency: 'monthly' as const,
      federalWithholding: 0.22,
      stateWithholding: 0.05,
    }
    render(<EmployeeForm employee={employee} onClose={vi.fn()} />)
    expect(
      screen.getByRole('dialog', { name: 'Edit Employee' })
    ).toBeInTheDocument()
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })
})
