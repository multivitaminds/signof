// ─── Fiscal Year ─────────────────────────────────────────────────────

export const FiscalYear = {
  Y2024: '2024',
  Y2025: '2025',
  Y2026: '2026',
} as const

export type FiscalYear = (typeof FiscalYear)[keyof typeof FiscalYear]

export const FISCAL_YEARS: FiscalYear[] = ['2026', '2025', '2024']

// ─── Account Type ───────────────────────────────────────────────────

export const AccountType = {
  Asset: 'asset',
  Liability: 'liability',
  Equity: 'equity',
  Revenue: 'revenue',
  Expense: 'expense',
} as const

export type AccountType = (typeof AccountType)[keyof typeof AccountType]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.Asset]: 'Asset',
  [AccountType.Liability]: 'Liability',
  [AccountType.Equity]: 'Equity',
  [AccountType.Revenue]: 'Revenue',
  [AccountType.Expense]: 'Expense',
}

// ─── Account Sub-Type ───────────────────────────────────────────────

export const AccountSubType = {
  Checking: 'checking',
  Savings: 'savings',
  AccountsReceivable: 'accounts_receivable',
  OtherCurrentAsset: 'other_current_asset',
  FixedAsset: 'fixed_asset',
  AccountsPayable: 'accounts_payable',
  CreditCard: 'credit_card',
  OtherCurrentLiability: 'other_current_liability',
  LongTermLiability: 'long_term_liability',
  OwnersEquity: 'owners_equity',
  RetainedEarnings: 'retained_earnings',
  ServiceRevenue: 'service_revenue',
  ProductRevenue: 'product_revenue',
  OtherIncome: 'other_income',
  CostOfGoods: 'cost_of_goods',
  OperatingExpense: 'operating_expense',
  OtherExpense: 'other_expense',
} as const

export type AccountSubType = (typeof AccountSubType)[keyof typeof AccountSubType]

export const ACCOUNT_SUBTYPE_LABELS: Record<AccountSubType, string> = {
  [AccountSubType.Checking]: 'Checking',
  [AccountSubType.Savings]: 'Savings',
  [AccountSubType.AccountsReceivable]: 'Accounts Receivable',
  [AccountSubType.OtherCurrentAsset]: 'Other Current Asset',
  [AccountSubType.FixedAsset]: 'Fixed Asset',
  [AccountSubType.AccountsPayable]: 'Accounts Payable',
  [AccountSubType.CreditCard]: 'Credit Card',
  [AccountSubType.OtherCurrentLiability]: 'Other Current Liability',
  [AccountSubType.LongTermLiability]: 'Long-Term Liability',
  [AccountSubType.OwnersEquity]: "Owner's Equity",
  [AccountSubType.RetainedEarnings]: 'Retained Earnings',
  [AccountSubType.ServiceRevenue]: 'Service Revenue',
  [AccountSubType.ProductRevenue]: 'Product Revenue',
  [AccountSubType.OtherIncome]: 'Other Income',
  [AccountSubType.CostOfGoods]: 'Cost of Goods Sold',
  [AccountSubType.OperatingExpense]: 'Operating Expense',
  [AccountSubType.OtherExpense]: 'Other Expense',
}

export const SUBTYPE_TO_TYPE: Record<AccountSubType, AccountType> = {
  [AccountSubType.Checking]: AccountType.Asset,
  [AccountSubType.Savings]: AccountType.Asset,
  [AccountSubType.AccountsReceivable]: AccountType.Asset,
  [AccountSubType.OtherCurrentAsset]: AccountType.Asset,
  [AccountSubType.FixedAsset]: AccountType.Asset,
  [AccountSubType.AccountsPayable]: AccountType.Liability,
  [AccountSubType.CreditCard]: AccountType.Liability,
  [AccountSubType.OtherCurrentLiability]: AccountType.Liability,
  [AccountSubType.LongTermLiability]: AccountType.Liability,
  [AccountSubType.OwnersEquity]: AccountType.Equity,
  [AccountSubType.RetainedEarnings]: AccountType.Equity,
  [AccountSubType.ServiceRevenue]: AccountType.Revenue,
  [AccountSubType.ProductRevenue]: AccountType.Revenue,
  [AccountSubType.OtherIncome]: AccountType.Revenue,
  [AccountSubType.CostOfGoods]: AccountType.Expense,
  [AccountSubType.OperatingExpense]: AccountType.Expense,
  [AccountSubType.OtherExpense]: AccountType.Expense,
}

// ─── Transaction Type ───────────────────────────────────────────────

export const TransactionType = {
  Income: 'income',
  Expense: 'expense',
  Transfer: 'transfer',
  JournalEntry: 'journal_entry',
} as const

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.Income]: 'Income',
  [TransactionType.Expense]: 'Expense',
  [TransactionType.Transfer]: 'Transfer',
  [TransactionType.JournalEntry]: 'Journal Entry',
}

// ─── Invoice Status ─────────────────────────────────────────────────

export const AccInvoiceStatus = {
  Draft: 'draft',
  Sent: 'sent',
  Viewed: 'viewed',
  Paid: 'paid',
  PartiallyPaid: 'partially_paid',
  Overdue: 'overdue',
  Void: 'void',
} as const

export type AccInvoiceStatus = (typeof AccInvoiceStatus)[keyof typeof AccInvoiceStatus]

export const ACC_INVOICE_STATUS_LABELS: Record<AccInvoiceStatus, string> = {
  [AccInvoiceStatus.Draft]: 'Draft',
  [AccInvoiceStatus.Sent]: 'Sent',
  [AccInvoiceStatus.Viewed]: 'Viewed',
  [AccInvoiceStatus.Paid]: 'Paid',
  [AccInvoiceStatus.PartiallyPaid]: 'Partially Paid',
  [AccInvoiceStatus.Overdue]: 'Overdue',
  [AccInvoiceStatus.Void]: 'Void',
}

// ─── Payment Terms ──────────────────────────────────────────────────

export const PaymentTerms = {
  DueOnReceipt: 'due_on_receipt',
  Net15: 'net_15',
  Net30: 'net_30',
  Net45: 'net_45',
  Net60: 'net_60',
} as const

export type PaymentTerms = (typeof PaymentTerms)[keyof typeof PaymentTerms]

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  [PaymentTerms.DueOnReceipt]: 'Due on Receipt',
  [PaymentTerms.Net15]: 'Net 15',
  [PaymentTerms.Net30]: 'Net 30',
  [PaymentTerms.Net45]: 'Net 45',
  [PaymentTerms.Net60]: 'Net 60',
}

export const PAYMENT_TERMS_DAYS: Record<PaymentTerms, number> = {
  [PaymentTerms.DueOnReceipt]: 0,
  [PaymentTerms.Net15]: 15,
  [PaymentTerms.Net30]: 30,
  [PaymentTerms.Net45]: 45,
  [PaymentTerms.Net60]: 60,
}

// ─── Expense Category ───────────────────────────────────────────────

export const ExpenseCategory = {
  Advertising: 'advertising',
  Insurance: 'insurance',
  Legal: 'legal',
  Meals: 'meals',
  OfficeSupplies: 'office_supplies',
  Payroll: 'payroll',
  Rent: 'rent',
  Software: 'software',
  Travel: 'travel',
  Utilities: 'utilities',
  Other: 'other',
} as const

export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Advertising]: 'Advertising',
  [ExpenseCategory.Insurance]: 'Insurance',
  [ExpenseCategory.Legal]: 'Legal & Professional',
  [ExpenseCategory.Meals]: 'Meals & Entertainment',
  [ExpenseCategory.OfficeSupplies]: 'Office Supplies',
  [ExpenseCategory.Payroll]: 'Payroll',
  [ExpenseCategory.Rent]: 'Rent & Lease',
  [ExpenseCategory.Software]: 'Software & Subscriptions',
  [ExpenseCategory.Travel]: 'Travel',
  [ExpenseCategory.Utilities]: 'Utilities',
  [ExpenseCategory.Other]: 'Other',
}

// ─── Contact Type ───────────────────────────────────────────────────

export const ContactType = {
  Customer: 'customer',
  Vendor: 'vendor',
  Both: 'both',
} as const

export type ContactType = (typeof ContactType)[keyof typeof ContactType]

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  [ContactType.Customer]: 'Customer',
  [ContactType.Vendor]: 'Vendor',
  [ContactType.Both]: 'Customer & Vendor',
}

// ─── Reconciliation Status ──────────────────────────────────────────

export const ReconciliationStatus = {
  Unreconciled: 'unreconciled',
  Reconciled: 'reconciled',
  InReview: 'in_review',
} as const

export type ReconciliationStatus = (typeof ReconciliationStatus)[keyof typeof ReconciliationStatus]

export const RECONCILIATION_STATUS_LABELS: Record<ReconciliationStatus, string> = {
  [ReconciliationStatus.Unreconciled]: 'Unreconciled',
  [ReconciliationStatus.Reconciled]: 'Reconciled',
  [ReconciliationStatus.InReview]: 'In Review',
}

// ─── Pay Frequency ──────────────────────────────────────────────────

export const PayFrequency = {
  Weekly: 'weekly',
  Biweekly: 'biweekly',
  Semimonthly: 'semimonthly',
  Monthly: 'monthly',
} as const

export type PayFrequency = (typeof PayFrequency)[keyof typeof PayFrequency]

export const PAY_FREQUENCY_LABELS: Record<PayFrequency, string> = {
  [PayFrequency.Weekly]: 'Weekly',
  [PayFrequency.Biweekly]: 'Bi-weekly',
  [PayFrequency.Semimonthly]: 'Semi-monthly',
  [PayFrequency.Monthly]: 'Monthly',
}

// ─── Payroll Status ─────────────────────────────────────────────────

export const PayrollStatus = {
  Draft: 'draft',
  Processing: 'processing',
  Completed: 'completed',
  Failed: 'failed',
} as const

export type PayrollStatus = (typeof PayrollStatus)[keyof typeof PayrollStatus]

export const PAYROLL_STATUS_LABELS: Record<PayrollStatus, string> = {
  [PayrollStatus.Draft]: 'Draft',
  [PayrollStatus.Processing]: 'Processing',
  [PayrollStatus.Completed]: 'Completed',
  [PayrollStatus.Failed]: 'Failed',
}

// ─── Employee Status ────────────────────────────────────────────────

export const EmployeeStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Terminated: 'terminated',
} as const

export type EmployeeStatus = (typeof EmployeeStatus)[keyof typeof EmployeeStatus]

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Active]: 'Active',
  [EmployeeStatus.Inactive]: 'Inactive',
  [EmployeeStatus.Terminated]: 'Terminated',
}

// ─── Interfaces ─────────────────────────────────────────────────────

export interface Account {
  id: string
  name: string
  code: string
  type: AccountType
  subType: AccountSubType
  description: string
  balance: number
  createdAt: string
}

export interface TransactionLine {
  id: string
  accountId: string
  accountName: string
  debit: number
  credit: number
  description: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  type: TransactionType
  lines: TransactionLine[]
  reference: string
  reconciliationStatus: ReconciliationStatus
  contactId: string | null
  createdAt: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  issueDate: string
  dueDate: string
  paymentTerms: PaymentTerms
  status: AccInvoiceStatus
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  amountPaid: number
  balance: number
  notes: string
  createdAt: string
}

export interface Expense {
  id: string
  date: string
  amount: number
  vendorId: string | null
  vendorName: string
  categoryId: ExpenseCategory
  description: string
  accountId: string
  receipt: string | null
  recurring: boolean
  createdAt: string
}

export interface AccountingContact {
  id: string
  name: string
  company: string
  email: string
  phone: string
  type: ContactType
  address: string
  outstandingBalance: number
  createdAt: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  title: string
  department: string
  startDate: string
  status: EmployeeStatus
  payRate: number
  payFrequency: PayFrequency
  federalWithholding: number
  stateWithholding: number
}

export interface PayStub {
  id: string
  payRunId: string
  employeeId: string
  employeeName: string
  payPeriodStart: string
  payPeriodEnd: string
  grossPay: number
  federalTax: number
  stateTax: number
  netPay: number
  ytdGross: number
  ytdFederalTax: number
  ytdStateTax: number
  ytdNetPay: number
}

export interface PayRun {
  id: string
  payDate: string
  status: PayrollStatus
  employeeCount: number
  totalGross: number
  totalTaxes: number
  totalNet: number
  createdAt: string
}

export interface ReportDateRange {
  startDate: string
  endDate: string
}

export interface ProfitAndLossRow {
  accountName: string
  amount: number
}

export interface BalanceSheetRow {
  accountName: string
  amount: number
}

export interface CashFlowRow {
  description: string
  amount: number
}
