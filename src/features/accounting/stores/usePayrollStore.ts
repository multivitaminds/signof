import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Employee, PayRun, PayStub, PayrollStatus } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createSampleEmployees(): Employee[] {
  return [
    { id: 'emp-1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@company.com', phone: '(555) 111-1111', title: 'Engineering Manager', department: 'Engineering', startDate: '2024-03-15', status: 'active', payRate: 120000, payFrequency: 'monthly', federalWithholding: 0.22, stateWithholding: 0.05 },
    { id: 'emp-2', firstName: 'James', lastName: 'Chen', email: 'james.chen@company.com', phone: '(555) 222-2222', title: 'Senior Developer', department: 'Engineering', startDate: '2024-06-01', status: 'active', payRate: 95000, payFrequency: 'biweekly', federalWithholding: 0.22, stateWithholding: 0.05 },
    { id: 'emp-3', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@company.com', phone: '(555) 333-3333', title: 'UI/UX Designer', department: 'Design', startDate: '2025-01-10', status: 'active', payRate: 80000, payFrequency: 'semimonthly', federalWithholding: 0.12, stateWithholding: 0.04 },
    { id: 'emp-4', firstName: 'David', lastName: 'Kim', email: 'david.kim@company.com', phone: '(555) 444-4444', title: 'Sales Representative', department: 'Sales', startDate: '2025-04-20', status: 'active', payRate: 65000, payFrequency: 'monthly', federalWithholding: 0.12, stateWithholding: 0.03 },
  ]
}

function calculateGrossPay(payRate: number, payFrequency: string): number {
  switch (payFrequency) {
    case 'weekly': return payRate / 52
    case 'biweekly': return payRate / 26
    case 'semimonthly': return payRate / 24
    case 'monthly': return payRate / 12
    default: return payRate / 12
  }
}

function createSamplePayRuns(): PayRun[] {
  const now = new Date().toISOString()
  return [
    { id: 'pr-1', payDate: '2026-01-31', status: 'completed', employeeCount: 4, totalGross: 30000, totalTaxes: 5520, totalNet: 24480, createdAt: now },
    { id: 'pr-2', payDate: '2025-12-31', status: 'completed', employeeCount: 4, totalGross: 30000, totalTaxes: 5520, totalNet: 24480, createdAt: now },
  ]
}

function createSamplePayStubs(): PayStub[] {
  const employees = createSampleEmployees()
  const stubs: PayStub[] = []

  for (const pr of ['pr-1', 'pr-2']) {
    const isJan = pr === 'pr-1'
    for (const emp of employees) {
      const gross = calculateGrossPay(emp.payRate, emp.payFrequency)
      const fedTax = gross * emp.federalWithholding
      const stateTax = gross * emp.stateWithholding
      const net = gross - fedTax - stateTax
      const multiplier = isJan ? 1 : 1

      stubs.push({
        id: generateId(),
        payRunId: pr,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        payPeriodStart: isJan ? '2026-01-01' : '2025-12-01',
        payPeriodEnd: isJan ? '2026-01-31' : '2025-12-31',
        grossPay: Math.round(gross * 100) / 100,
        federalTax: Math.round(fedTax * 100) / 100,
        stateTax: Math.round(stateTax * 100) / 100,
        netPay: Math.round(net * 100) / 100,
        ytdGross: Math.round(gross * multiplier * 100) / 100,
        ytdFederalTax: Math.round(fedTax * multiplier * 100) / 100,
        ytdStateTax: Math.round(stateTax * multiplier * 100) / 100,
        ytdNetPay: Math.round(net * multiplier * 100) / 100,
      })
    }
  }

  return stubs
}

interface PayrollState {
  employees: Employee[]
  payRuns: PayRun[]
  payStubs: PayStub[]

  addEmployee: (employee: Omit<Employee, 'id'>) => void
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  createPayRun: (payDate: string, employeeIds: string[]) => PayRun
  processPayRun: (id: string) => Promise<void>
  getPayRunsByStatus: (status: PayrollStatus) => PayRun[]
  getStubsByEmployee: (employeeId: string) => PayStub[]
  getStubsByPayRun: (payRunId: string) => PayStub[]
  clearData: () => void
}

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set, get) => ({
      employees: createSampleEmployees(),
      payRuns: createSamplePayRuns(),
      payStubs: createSamplePayStubs(),

      addEmployee: (employee) =>
        set((state) => ({
          employees: [...state.employees, { ...employee, id: generateId() }],
        })),

      updateEmployee: (id, updates) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        })),

      createPayRun: (payDate, employeeIds) => {
        const employees = get().employees.filter((e) => employeeIds.includes(e.id))
        let totalGross = 0
        let totalTaxes = 0

        for (const emp of employees) {
          const gross = calculateGrossPay(emp.payRate, emp.payFrequency)
          const taxes = gross * (emp.federalWithholding + emp.stateWithholding)
          totalGross += gross
          totalTaxes += taxes
        }

        const payRun: PayRun = {
          id: generateId(),
          payDate,
          status: 'draft',
          employeeCount: employees.length,
          totalGross: Math.round(totalGross * 100) / 100,
          totalTaxes: Math.round(totalTaxes * 100) / 100,
          totalNet: Math.round((totalGross - totalTaxes) * 100) / 100,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          payRuns: [...state.payRuns, payRun],
        }))

        return payRun
      },

      processPayRun: async (id) => {
        // Set to processing
        set((state) => ({
          payRuns: state.payRuns.map((pr) =>
            pr.id === id ? { ...pr, status: 'processing' as const } : pr
          ),
        }))

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const payRun = get().payRuns.find((pr) => pr.id === id)
        if (!payRun) return

        // Create pay stubs for all employees
        const employees = get().employees.filter((e) => e.status === 'active')
        const newStubs: PayStub[] = employees.map((emp) => {
          const gross = calculateGrossPay(emp.payRate, emp.payFrequency)
          const fedTax = gross * emp.federalWithholding
          const stateTax = gross * emp.stateWithholding
          const net = gross - fedTax - stateTax

          // Calculate YTD from existing stubs
          const existingStubs = get().payStubs.filter((s) => s.employeeId === emp.id)
          const ytdGross = existingStubs.reduce((sum, s) => sum + s.grossPay, 0) + gross
          const ytdFedTax = existingStubs.reduce((sum, s) => sum + s.federalTax, 0) + fedTax
          const ytdStateTax = existingStubs.reduce((sum, s) => sum + s.stateTax, 0) + stateTax
          const ytdNet = existingStubs.reduce((sum, s) => sum + s.netPay, 0) + net

          return {
            id: generateId(),
            payRunId: id,
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            payPeriodStart: payRun.payDate,
            payPeriodEnd: payRun.payDate,
            grossPay: Math.round(gross * 100) / 100,
            federalTax: Math.round(fedTax * 100) / 100,
            stateTax: Math.round(stateTax * 100) / 100,
            netPay: Math.round(net * 100) / 100,
            ytdGross: Math.round(ytdGross * 100) / 100,
            ytdFederalTax: Math.round(ytdFedTax * 100) / 100,
            ytdStateTax: Math.round(ytdStateTax * 100) / 100,
            ytdNetPay: Math.round(ytdNet * 100) / 100,
          }
        })

        set((state) => ({
          payRuns: state.payRuns.map((pr) =>
            pr.id === id ? { ...pr, status: 'completed' as const } : pr
          ),
          payStubs: [...state.payStubs, ...newStubs],
        }))
      },

      getPayRunsByStatus: (status) => get().payRuns.filter((pr) => pr.status === status),

      getStubsByEmployee: (employeeId) => get().payStubs.filter((s) => s.employeeId === employeeId),

      getStubsByPayRun: (payRunId) => get().payStubs.filter((s) => s.payRunId === payRunId),

      clearData: () =>
        set({
          employees: [],
          payRuns: [],
          payStubs: [],
        }),
    }),
    { name: 'orchestree-payroll-storage' }
  )
)
