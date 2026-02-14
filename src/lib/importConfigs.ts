import type {
  AccountingContact,
  ContactType,
  Employee,
  EmployeeStatus,
  Expense,
  ExpenseCategory,
  Invoice,
  PayFrequency,
  Transaction,
  TransactionType,
} from '../features/accounting/types'

// ─── Generic Types ─────────────────────────────────────────────────

export interface ImportFieldConfig {
  key: string
  label: string
  required: boolean
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum'
  enumValues?: string[]
  defaultValue?: unknown
  aliases: string[]
}

export interface ImportValidationResult<T> {
  valid: boolean
  errors: string[]
  data: Partial<T>
}

export interface ImportConfig<T> {
  entityName: string
  fields: ImportFieldConfig[]
  validate: (row: Record<string, string>) => ImportValidationResult<T>
  sampleCsv: string
}

// ─── Validation Helpers ────────────────────────────────────────────

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value))
}

function coerceBoolean(value: string): boolean | null {
  const lower = value.toLowerCase().trim()
  if (['true', 'yes', '1'].includes(lower)) return true
  if (['false', 'no', '0'].includes(lower)) return false
  return null
}

function buildValidator<T>(fields: ImportFieldConfig[]) {
  return (row: Record<string, string>): ImportValidationResult<T> => {
    const errors: string[] = []
    const data: Record<string, unknown> = {}

    for (const field of fields) {
      const rawValue = row[field.key] ?? ''
      const isEmpty = rawValue.trim() === ''

      if (field.required && isEmpty) {
        errors.push(`${field.label} is required`)
        continue
      }

      if (isEmpty) {
        if (field.defaultValue !== undefined) {
          data[field.key] = field.defaultValue
        }
        continue
      }

      const value = rawValue.trim()

      switch (field.type) {
        case 'string':
          data[field.key] = value
          break

        case 'number': {
          const num = parseFloat(value)
          if (isNaN(num)) {
            errors.push(`${field.label} must be a valid number`)
          } else {
            data[field.key] = num
          }
          break
        }

        case 'date':
          if (!isValidDate(value)) {
            errors.push(`${field.label} must be a valid date (YYYY-MM-DD)`)
          } else {
            data[field.key] = value
          }
          break

        case 'boolean': {
          const bool = coerceBoolean(value)
          if (bool === null) {
            errors.push(`${field.label} must be true/false, yes/no, or 1/0`)
          } else {
            data[field.key] = bool
          }
          break
        }

        case 'enum':
          if (field.enumValues && !field.enumValues.includes(value.toLowerCase())) {
            errors.push(`${field.label} must be one of: ${field.enumValues.join(', ')}`)
          } else {
            data[field.key] = value.toLowerCase()
          }
          break
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data: data as Partial<T>,
    }
  }
}

// ─── Contact Import Config ─────────────────────────────────────────

export function createContactImportConfig(): ImportConfig<AccountingContact> {
  const fields: ImportFieldConfig[] = [
    { key: 'name', label: 'Name', required: true, type: 'string', aliases: ['contact name', 'full name', 'contact'] },
    { key: 'email', label: 'Email', required: true, type: 'string', aliases: ['email address', 'e-mail', 'mail'] },
    { key: 'company', label: 'Company', required: false, type: 'string', aliases: ['company name', 'organization', 'org'] },
    { key: 'phone', label: 'Phone', required: false, type: 'string', aliases: ['phone number', 'telephone', 'tel', 'mobile'] },
    { key: 'type', label: 'Type', required: false, type: 'enum', enumValues: ['customer', 'vendor', 'both'] as ContactType[], defaultValue: 'customer', aliases: ['contact type', 'category'] },
    { key: 'address', label: 'Address', required: false, type: 'string', aliases: ['street address', 'mailing address', 'location'] },
    { key: 'outstandingBalance', label: 'Outstanding Balance', required: false, type: 'number', defaultValue: 0, aliases: ['balance', 'amount owed', 'outstanding'] },
  ]

  return {
    entityName: 'Contact',
    fields,
    validate: buildValidator<AccountingContact>(fields),
    sampleCsv: 'name,email,company,phone,type,address,outstandingBalance\nJane Smith,jane@example.com,Acme Corp,555-0100,customer,"123 Main St, NY",0\nBob Jones,bob@vendor.com,Supply Co,555-0200,vendor,"456 Oak Ave, CA",1500.50',
  }
}

// ─── Expense Import Config ─────────────────────────────────────────

export function createExpenseImportConfig(): ImportConfig<Expense> {
  const fields: ImportFieldConfig[] = [
    { key: 'date', label: 'Date', required: true, type: 'date', aliases: ['expense date', 'transaction date', 'posted date'] },
    { key: 'amount', label: 'Amount', required: true, type: 'number', aliases: ['total', 'cost', 'price', 'expense amount'] },
    { key: 'vendorName', label: 'Vendor', required: true, type: 'string', aliases: ['vendor name', 'payee', 'merchant', 'supplier'] },
    { key: 'categoryId', label: 'Category', required: false, type: 'enum', enumValues: ['advertising', 'insurance', 'legal', 'meals', 'office_supplies', 'payroll', 'rent', 'software', 'travel', 'utilities', 'other'] as ExpenseCategory[], defaultValue: 'other', aliases: ['expense category', 'type', 'expense type'] },
    { key: 'description', label: 'Description', required: false, type: 'string', aliases: ['memo', 'notes', 'details', 'note'] },
    { key: 'accountId', label: 'Account', required: false, type: 'string', aliases: ['account name', 'payment account', 'bank account'] },
    { key: 'recurring', label: 'Recurring', required: false, type: 'boolean', defaultValue: false, aliases: ['is recurring', 'repeat', 'recurrence'] },
  ]

  return {
    entityName: 'Expense',
    fields,
    validate: buildValidator<Expense>(fields),
    sampleCsv: 'date,amount,vendorName,categoryId,description,accountId,recurring\n2025-01-15,250.00,Office Depot,office_supplies,Printer paper and toner,,false\n2025-01-20,1200.00,AWS,software,Monthly cloud hosting,,true',
  }
}

// ─── Employee Import Config ────────────────────────────────────────

export function createEmployeeImportConfig(): ImportConfig<Employee> {
  const fields: ImportFieldConfig[] = [
    { key: 'firstName', label: 'First Name', required: true, type: 'string', aliases: ['first', 'firstname', 'given name'] },
    { key: 'lastName', label: 'Last Name', required: true, type: 'string', aliases: ['last', 'lastname', 'surname', 'family name'] },
    { key: 'email', label: 'Email', required: true, type: 'string', aliases: ['email address', 'e-mail', 'work email'] },
    { key: 'title', label: 'Title', required: true, type: 'string', aliases: ['job title', 'position', 'role'] },
    { key: 'startDate', label: 'Start Date', required: true, type: 'date', aliases: ['hire date', 'start', 'date hired', 'join date'] },
    { key: 'payRate', label: 'Pay Rate', required: true, type: 'number', aliases: ['salary', 'wage', 'rate', 'compensation', 'pay'] },
    { key: 'payFrequency', label: 'Pay Frequency', required: false, type: 'enum', enumValues: ['weekly', 'biweekly', 'semimonthly', 'monthly'] as PayFrequency[], defaultValue: 'monthly', aliases: ['frequency', 'pay period', 'pay schedule'] },
    { key: 'department', label: 'Department', required: false, type: 'string', aliases: ['dept', 'team', 'division'] },
    { key: 'phone', label: 'Phone', required: false, type: 'string', aliases: ['phone number', 'telephone', 'mobile', 'cell'] },
    { key: 'status', label: 'Status', required: false, type: 'enum', enumValues: ['active', 'inactive', 'terminated'] as EmployeeStatus[], defaultValue: 'active', aliases: ['employee status', 'employment status'] },
    { key: 'federalWithholding', label: 'Federal Withholding', required: false, type: 'number', defaultValue: 0.22, aliases: ['federal tax', 'fed withholding', 'federal rate'] },
    { key: 'stateWithholding', label: 'State Withholding', required: false, type: 'number', defaultValue: 0.05, aliases: ['state tax', 'state rate'] },
  ]

  return {
    entityName: 'Employee',
    fields,
    validate: buildValidator<Employee>(fields),
    sampleCsv: 'firstName,lastName,email,title,startDate,payRate,payFrequency,department,phone\nAlice,Johnson,alice@company.com,Software Engineer,2024-03-15,95000,monthly,Engineering,555-0100\nBob,Williams,bob@company.com,Product Manager,2024-06-01,105000,biweekly,Product,555-0200',
  }
}

// ─── Invoice Import Config ─────────────────────────────────────────

export function createInvoiceImportConfig(): ImportConfig<Invoice> {
  const fields: ImportFieldConfig[] = [
    { key: 'customerName', label: 'Customer Name', required: true, type: 'string', aliases: ['customer', 'client', 'client name', 'bill to'] },
    { key: 'issueDate', label: 'Issue Date', required: true, type: 'date', aliases: ['invoice date', 'date', 'created date'] },
    { key: 'dueDate', label: 'Due Date', required: true, type: 'date', aliases: ['payment due', 'due', 'payment date'] },
    { key: 'description', label: 'Description', required: true, type: 'string', aliases: ['item', 'line item', 'service', 'product'] },
    { key: 'quantity', label: 'Quantity', required: true, type: 'number', aliases: ['qty', 'units', 'count'] },
    { key: 'rate', label: 'Rate', required: true, type: 'number', aliases: ['unit price', 'price', 'amount', 'unit cost'] },
    { key: 'taxRate', label: 'Tax Rate', required: false, type: 'number', defaultValue: 0, aliases: ['tax', 'tax %', 'tax percent'] },
    { key: 'discount', label: 'Discount', required: false, type: 'number', defaultValue: 0, aliases: ['discount amount', 'discount %'] },
    { key: 'notes', label: 'Notes', required: false, type: 'string', aliases: ['memo', 'comments', 'remarks'] },
  ]

  return {
    entityName: 'Invoice',
    fields,
    validate: buildValidator<Invoice>(fields),
    sampleCsv: 'customerName,issueDate,dueDate,description,quantity,rate,taxRate,discount,notes\nAcme Corp,2025-01-01,2025-01-31,Web Development,40,150,0.08,0,January sprint\nGlobex Inc,2025-01-15,2025-02-14,Consulting,20,200,0.08,50,Strategy session',
  }
}

// ─── Transaction Import Config ─────────────────────────────────────

export function createTransactionImportConfig(): ImportConfig<Transaction> {
  const fields: ImportFieldConfig[] = [
    { key: 'date', label: 'Date', required: true, type: 'date', aliases: ['transaction date', 'posted date', 'post date'] },
    { key: 'description', label: 'Description', required: true, type: 'string', aliases: ['memo', 'notes', 'details', 'payee', 'narrative'] },
    { key: 'amount', label: 'Amount', required: true, type: 'number', aliases: ['total', 'value', 'sum', 'debit', 'credit'] },
    { key: 'type', label: 'Type', required: false, type: 'enum', enumValues: ['income', 'expense', 'transfer', 'journal_entry'] as TransactionType[], defaultValue: 'expense', aliases: ['transaction type', 'category', 'kind'] },
    { key: 'reference', label: 'Reference', required: false, type: 'string', aliases: ['ref', 'reference number', 'check number', 'ref #', 'check #'] },
  ]

  return {
    entityName: 'Transaction',
    fields,
    validate: buildValidator<Transaction>(fields),
    sampleCsv: 'date,description,amount,type,reference\n2025-01-10,Client payment received,5000.00,income,INV-001\n2025-01-12,Office rent payment,2500.00,expense,CHK-1042',
  }
}
