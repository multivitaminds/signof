import { render, screen } from '@testing-library/react'
import PayrollPage from './PayrollPage'

vi.mock('../stores/usePayrollStore', () => ({
  usePayrollStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      employees: [
        {
          id: 'emp-1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@company.com',
          phone: '(555) 111-1111',
          title: 'Engineering Manager',
          department: 'Engineering',
          startDate: '2024-03-15',
          status: 'active',
          payRate: 120000,
          payFrequency: 'monthly',
          federalWithholding: 0.22,
          stateWithholding: 0.05,
        },
        {
          id: 'emp-2',
          firstName: 'James',
          lastName: 'Chen',
          email: 'james@company.com',
          phone: '(555) 222-2222',
          title: 'Senior Developer',
          department: 'Engineering',
          startDate: '2024-06-01',
          status: 'inactive',
          payRate: 95000,
          payFrequency: 'biweekly',
          federalWithholding: 0.22,
          stateWithholding: 0.05,
        },
      ],
      payRuns: [
        {
          id: 'pr-1',
          payDate: '2026-01-31',
          status: 'completed',
          employeeCount: 4,
          totalGross: 30000,
          totalTaxes: 5520,
          totalNet: 24480,
          createdAt: '2026-01-31T00:00:00Z',
        },
      ],
      deleteEmployee: vi.fn(),
    }),
}))

vi.mock('../components/EmployeeForm/EmployeeForm', () => ({
  default: () => <div data-testid="employee-form">EmployeeForm</div>,
}))

vi.mock('../components/PayRunWizard/PayRunWizard', () => ({
  default: () => <div data-testid="pay-run-wizard">PayRunWizard</div>,
}))

vi.mock('../components/PayStubModal/PayStubModal', () => ({
  default: () => <div data-testid="pay-stub-modal">PayStubModal</div>,
}))

describe('PayrollPage', () => {
  it('renders the Payroll heading', () => {
    render(<PayrollPage />)
    expect(screen.getByRole('heading', { name: 'Payroll' })).toBeInTheDocument()
  })

  it('renders Run Payroll and Add Employee buttons', () => {
    render(<PayrollPage />)
    expect(screen.getByText('Run Payroll')).toBeInTheDocument()
    expect(screen.getByText('Add Employee')).toBeInTheDocument()
  })

  it('renders employee table with employee data', () => {
    render(<PayrollPage />)
    expect(screen.getByRole('heading', { name: 'Employees' })).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('James Chen')).toBeInTheDocument()
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })

  it('renders employee status badges', () => {
    render(<PayrollPage />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('renders pay frequency labels', () => {
    render(<PayrollPage />)
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Bi-weekly')).toBeInTheDocument()
  })

  it('renders Pay Run History section', () => {
    render(<PayrollPage />)
    expect(screen.getByText('Pay Run History')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders view stubs button for pay runs', () => {
    render(<PayrollPage />)
    expect(screen.getByText('View Stubs')).toBeInTheDocument()
  })
})
