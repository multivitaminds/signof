import { render, screen } from '@testing-library/react'
import PayRunWizard from './PayRunWizard'

vi.mock('../../stores/usePayrollStore', () => ({
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
          status: 'active',
          payRate: 95000,
          payFrequency: 'biweekly',
          federalWithholding: 0.22,
          stateWithholding: 0.05,
        },
        {
          id: 'emp-3',
          firstName: 'Inactive',
          lastName: 'Person',
          email: 'inactive@company.com',
          phone: '',
          title: 'Former Employee',
          department: 'HR',
          startDate: '2023-01-01',
          status: 'terminated',
          payRate: 50000,
          payFrequency: 'monthly',
          federalWithholding: 0.12,
          stateWithholding: 0.04,
        },
      ],
      createPayRun: vi.fn().mockReturnValue({ id: 'pr-new' }),
      processPayRun: vi.fn().mockResolvedValue(undefined),
    }),
}))

describe('PayRunWizard', () => {
  it('renders step 1 with Select Employees heading', () => {
    render(<PayRunWizard onClose={vi.fn()} />)
    expect(screen.getByText('Select Employees')).toBeInTheDocument()
  })

  it('renders step indicator with 3 steps', () => {
    render(<PayRunWizard onClose={vi.fn()} />)
    expect(screen.getByText('Select')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('shows only active employees with checkboxes', () => {
    render(<PayRunWizard onClose={vi.fn()} />)
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('James Chen')).toBeInTheDocument()
    // Terminated employee should not appear
    expect(screen.queryByText('Inactive Person')).not.toBeInTheDocument()
  })

  it('renders Select All checkbox', () => {
    render(<PayRunWizard onClose={vi.fn()} />)
    expect(screen.getByText('Select All')).toBeInTheDocument()
  })

  it('renders Next button disabled when none selected', () => {
    render(<PayRunWizard onClose={vi.fn()} />)
    const nextBtn = screen.getByText('Next')
    expect(nextBtn).toBeDisabled()
  })

  it('renders Cancel button on step 1', () => {
    render(<PayRunWizard onClose={vi.fn()} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})
