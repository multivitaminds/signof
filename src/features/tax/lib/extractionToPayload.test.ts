import {
  getFieldValue,
  getNumericValue,
  extractionToW2Employee,
  extractionTo1099NecRecipient,
  extractionTo1099MiscRecipient,
  extractionTo1099IntRecipient,
  extractionTo1099DivRecipient,
  extractionTo1099RRecipient,
  extractionTo1099KRecipient,
  extractionTo1098Recipient,
  filingToBusinessData,
} from './extractionToPayload'
import type { ExtractionField, TaxFiling, ExtractionConfidence } from '../types'
import { FilingState, FilingStatus, STANDARD_DEDUCTION_2025 } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────

function makeField(
  key: string,
  value: string,
  confidence: ExtractionConfidence = 'high'
): ExtractionField {
  return { key, value, confidence, confirmed: false }
}

function makeFiling(overrides: Partial<TaxFiling> = {}): TaxFiling {
  return {
    id: 'filing_1',
    taxYear: '2025',
    state: FilingState.InProgress,
    filingStatus: FilingStatus.Single,
    firstName: 'Jane',
    lastName: 'Doe',
    ssn: '123-45-6789',
    email: 'jane@example.com',
    phone: '5551234567',
    address: {
      street: '100 Main St',
      apt: 'Apt 2B',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
    },
    wages: 80000,
    otherIncome: 5000,
    totalIncome: 85000,
    useStandardDeduction: true,
    standardDeduction: STANDARD_DEDUCTION_2025,
    itemizedDeductions: 0,
    effectiveDeduction: STANDARD_DEDUCTION_2025,
    taxableIncome: 70000,
    federalTax: 10000,
    estimatedPayments: 0,
    withheld: 12000,
    refundOrOwed: -2000,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    filedAt: null,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('getFieldValue', () => {
  const fields: ExtractionField[] = [
    makeField('Wages (Box 1)', '85000.00'),
    makeField('Federal Tax Withheld (Box 2)', '14500.00'),
    makeField('Employer Name', 'Acme Corp'),
  ]

  it('finds a field matching the pattern', () => {
    expect(getFieldValue(fields, /wages.*box\s*1/i)).toBe('85000.00')
  })

  it('returns empty string when no match', () => {
    expect(getFieldValue(fields, /nonexistent/i)).toBe('')
  })

  it('returns the first match when multiple match', () => {
    const dupes = [...fields, makeField('Wages (Box 1) Adjusted', '90000')]
    expect(getFieldValue(dupes, /wages.*box\s*1/i)).toBe('85000.00')
  })
})

describe('getNumericValue', () => {
  it('parses plain numbers', () => {
    const fields = [makeField('Amount', '12345.67')]
    expect(getNumericValue(fields, /amount/i)).toBe(12345.67)
  })

  it('handles dollar signs and commas', () => {
    const fields = [makeField('Wages (Box 1)', '$85,000.00')]
    expect(getNumericValue(fields, /wages/i)).toBe(85000)
  })

  it('returns 0 for empty values', () => {
    const fields = [makeField('Amount', '')]
    expect(getNumericValue(fields, /amount/i)).toBe(0)
  })

  it('returns 0 for non-numeric values', () => {
    const fields = [makeField('Name', 'Acme Corp')]
    expect(getNumericValue(fields, /name/i)).toBe(0)
  })

  it('returns 0 when no field matches', () => {
    expect(getNumericValue([], /anything/i)).toBe(0)
  })

  it('handles whitespace in numbers', () => {
    const fields = [makeField('Tax', '  1 500.25  ')]
    expect(getNumericValue(fields, /tax/i)).toBe(1500.25)
  })
})

describe('extractionToW2Employee', () => {
  const w2Fields: ExtractionField[] = [
    makeField('Wages (Box 1)', '85000.00'),
    makeField('Federal Tax Withheld (Box 2)', '14500.00'),
    makeField('Social Security Wages (Box 3)', '85000.00', 'medium'),
    makeField('Social Security Tax Withheld (Box 4)', '5270.00'),
    makeField('Medicare Wages (Box 5)', '85000.00', 'medium'),
    makeField('Medicare Tax Withheld (Box 6)', '1232.50'),
    makeField('Employer Name', 'Acme Corporation'),
    makeField('Employer EIN', '12-3456789'),
  ]

  it('maps extraction fields to W-2 employee input', () => {
    const filing = makeFiling()
    const result = extractionToW2Employee(w2Fields, filing)

    expect(result.wages).toBe(85000)
    expect(result.federalTaxWithheld).toBe(14500)
    expect(result.socialSecurityWages).toBe(85000)
    expect(result.socialSecurityTax).toBe(5270)
    expect(result.medicareWages).toBe(85000)
    expect(result.medicareTax).toBe(1232.5)
  })

  it('uses filing data for personal info', () => {
    const filing = makeFiling()
    const result = extractionToW2Employee(w2Fields, filing)

    expect(result.ssn).toBe('123456789')
    expect(result.firstName).toBe('Jane')
    expect(result.lastName).toBe('Doe')
    expect(result.address1).toBe('100 Main St')
    expect(result.address2).toBe('Apt 2B')
    expect(result.city).toBe('Springfield')
    expect(result.state).toBe('IL')
    expect(result.zip).toBe('62704')
  })

  it('falls back to filing wages when extraction has no wages', () => {
    const filing = makeFiling({ wages: 70000 })
    const result = extractionToW2Employee([], filing)

    expect(result.wages).toBe(70000)
    expect(result.federalTaxWithheld).toBe(12000) // filing.withheld
  })

  it('falls back socialSecurityWages to wages when missing', () => {
    const fields = [makeField('Wages (Box 1)', '90000.00')]
    const filing = makeFiling()
    const result = extractionToW2Employee(fields, filing)

    expect(result.socialSecurityWages).toBe(90000)
    expect(result.medicareWages).toBe(90000)
  })

  it('strips non-digit chars from SSN', () => {
    const filing = makeFiling({ ssn: '***-**-6789' })
    const result = extractionToW2Employee([], filing)
    expect(result.ssn).toBe('6789')
  })

  it('omits apt as address2 when empty', () => {
    const filing = makeFiling({ address: { street: '1 Main', apt: '', city: 'C', state: 'IL', zip: '60000' } })
    const result = extractionToW2Employee([], filing)
    expect(result.address2).toBeUndefined()
  })
})

describe('extractionTo1099NecRecipient', () => {
  const necFields: ExtractionField[] = [
    makeField('Payer Name', 'Design Studio LLC'),
    makeField('Payer TIN', '98-7654321'),
    makeField('Nonemployee Compensation (Box 1)', '12000.00'),
    makeField('Federal Income Tax Withheld', '1200.00'),
  ]

  it('maps extraction fields to 1099-NEC recipient input', () => {
    const filing = makeFiling()
    const result = extractionTo1099NecRecipient(necFields, filing)

    expect(result.nonemployeeCompensation).toBe(12000)
    expect(result.federalTaxWithheld).toBe(1200)
  })

  it('uses filing data for personal info', () => {
    const filing = makeFiling()
    const result = extractionTo1099NecRecipient(necFields, filing)

    expect(result.tin).toBe('123456789')
    expect(result.name).toBe('Jane Doe')
    expect(result.address1).toBe('100 Main St')
    expect(result.city).toBe('Springfield')
  })

  it('falls back to filing otherIncome when extraction has no compensation', () => {
    const filing = makeFiling({ otherIncome: 8000 })
    const result = extractionTo1099NecRecipient([], filing)

    expect(result.nonemployeeCompensation).toBe(8000)
  })

  it('sets federalTaxWithheld to undefined when not in extraction', () => {
    const fields = [makeField('Nonemployee Compensation (Box 1)', '5000')]
    const result = extractionTo1099NecRecipient(fields, makeFiling())

    expect(result.federalTaxWithheld).toBeUndefined()
  })
})

describe('filingToBusinessData', () => {
  it('maps TaxFiling to BusinessData correctly', () => {
    const filing = makeFiling()
    const result = filingToBusinessData(filing)

    expect(result.businessName).toBe('Jane Doe')
    expect(result.taxIdType).toBe('SSN')
    expect(result.tin).toBe('123456789')
    expect(result.isEIN).toBe(false)
    expect(result.contactName).toBe('Jane Doe')
    expect(result.phone).toBe('5551234567')
    expect(result.email).toBe('jane@example.com')
    expect(result.address1).toBe('100 Main St')
    expect(result.address2).toBe('Apt 2B')
    expect(result.city).toBe('Springfield')
    expect(result.state).toBe('IL')
    expect(result.zip).toBe('62704')
  })

  it('strips non-digit chars from SSN', () => {
    const filing = makeFiling({ ssn: '***-**-4589' })
    const result = filingToBusinessData(filing)
    expect(result.tin).toBe('4589')
  })

  it('omits address2 when apt is empty', () => {
    const filing = makeFiling({
      address: { street: '1 Main', apt: '', city: 'C', state: 'IL', zip: '60000' },
    })
    const result = filingToBusinessData(filing)
    expect(result.address2).toBeUndefined()
  })

  it('trims name whitespace', () => {
    const filing = makeFiling({ firstName: '  Alex  ', lastName: '  Smith  ' })
    const result = filingToBusinessData(filing)
    expect(result.businessName).toBe('Alex     Smith')
    expect(result.contactName).toBe('Alex     Smith')
  })
})

describe('extractionTo1099MiscRecipient', () => {
  const miscFields: ExtractionField[] = [
    makeField('Rents (Box 1)', '12000.00'),
    makeField('Royalties (Box 2)', '3000.00'),
    makeField('Other Income (Box 3)', '2000.00'),
    makeField('Federal Income Tax Withheld', '500.00'),
  ]

  it('maps extraction fields to 1099-MISC recipient input', () => {
    const result = extractionTo1099MiscRecipient(miscFields, makeFiling())
    expect(result.rents).toBe(12000)
    expect(result.royalties).toBe(3000)
    expect(result.otherIncome).toBe(2000)
    expect(result.federalTaxWithheld).toBe(500)
  })

  it('uses filing data for personal info', () => {
    const result = extractionTo1099MiscRecipient(miscFields, makeFiling())
    expect(result.tin).toBe('123456789')
    expect(result.name).toBe('Jane Doe')
    expect(result.address1).toBe('100 Main St')
    expect(result.city).toBe('Springfield')
  })

  it('falls back to filing otherIncome when extraction is empty', () => {
    const result = extractionTo1099MiscRecipient([], makeFiling({ otherIncome: 7500 }))
    expect(result.otherIncome).toBe(7500)
  })

  it('returns correct structure shape', () => {
    const result = extractionTo1099MiscRecipient([], makeFiling())
    expect(result).toHaveProperty('tin')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('address1')
    expect(result).toHaveProperty('city')
    expect(result).toHaveProperty('state')
    expect(result).toHaveProperty('zip')
  })
})

describe('extractionTo1099IntRecipient', () => {
  const intFields: ExtractionField[] = [
    makeField('Interest Income (Box 1)', '1500.00'),
    makeField('Early Withdrawal Penalty (Box 2)', '75.00'),
    makeField('Interest on U.S. Bonds (Box 3)', '500.00'),
    makeField('Federal Income Tax Withheld (Box 4)', '280.00'),
  ]

  it('maps extraction fields to 1099-INT recipient input', () => {
    const result = extractionTo1099IntRecipient(intFields, makeFiling())
    expect(result.interestIncome).toBe(1500)
    expect(result.earlyWithdrawalPenalty).toBe(75)
    expect(result.interestOnUSBonds).toBe(500)
    expect(result.federalTaxWithheld).toBe(280)
  })

  it('uses filing data for personal info', () => {
    const result = extractionTo1099IntRecipient(intFields, makeFiling())
    expect(result.tin).toBe('123456789')
    expect(result.name).toBe('Jane Doe')
    expect(result.address1).toBe('100 Main St')
  })

  it('falls back to filing otherIncome when extraction has no interest', () => {
    const result = extractionTo1099IntRecipient([], makeFiling({ otherIncome: 3000 }))
    expect(result.interestIncome).toBe(3000)
  })

  it('handles empty extraction array', () => {
    const result = extractionTo1099IntRecipient([], makeFiling())
    expect(result.earlyWithdrawalPenalty).toBeUndefined()
    expect(result.interestOnUSBonds).toBeUndefined()
    expect(result.federalTaxWithheld).toBeUndefined()
  })
})

describe('extractionTo1099DivRecipient', () => {
  const divFields: ExtractionField[] = [
    makeField('Ordinary Dividends (Box 1a)', '5000.00'),
    makeField('Qualified Dividends (Box 1b)', '3000.00'),
    makeField('Capital Gain Distributions (Box 2a)', '1200.00'),
    makeField('Federal Income Tax Withheld (Box 4)', '700.00'),
  ]

  it('maps extraction fields to 1099-DIV recipient input', () => {
    const result = extractionTo1099DivRecipient(divFields, makeFiling())
    expect(result.ordinaryDividends).toBe(5000)
    expect(result.qualifiedDividends).toBe(3000)
    expect(result.capitalGainDistributions).toBe(1200)
    expect(result.federalTaxWithheld).toBe(700)
  })

  it('uses filing data for personal info', () => {
    const result = extractionTo1099DivRecipient(divFields, makeFiling())
    expect(result.tin).toBe('123456789')
    expect(result.name).toBe('Jane Doe')
  })

  it('falls back to filing otherIncome for ordinary dividends', () => {
    const result = extractionTo1099DivRecipient([], makeFiling({ otherIncome: 2500 }))
    expect(result.ordinaryDividends).toBe(2500)
  })

  it('handles empty extraction array', () => {
    const result = extractionTo1099DivRecipient([], makeFiling())
    expect(result.qualifiedDividends).toBeUndefined()
    expect(result.capitalGainDistributions).toBeUndefined()
    expect(result.federalTaxWithheld).toBeUndefined()
  })
})

describe('extractionTo1099RRecipient', () => {
  const rFields: ExtractionField[] = [
    makeField('Gross Distribution (Box 1)', '50000.00'),
    makeField('Taxable Amount (Box 2a)', '45000.00'),
    makeField('Federal Income Tax Withheld (Box 4)', '10000.00'),
    makeField('Distribution Code (Box 7)', '7'),
  ]

  it('maps extraction fields to 1099-R recipient input', () => {
    const result = extractionTo1099RRecipient(rFields, makeFiling())
    expect(result.grossDistribution).toBe(50000)
    expect(result.taxableAmount).toBe(45000)
    expect(result.federalTaxWithheld).toBe(10000)
    expect(result.distributionCode).toBe('7')
  })

  it('uses filing data for personal info', () => {
    const result = extractionTo1099RRecipient(rFields, makeFiling())
    expect(result.tin).toBe('123456789')
    expect(result.name).toBe('Jane Doe')
  })

  it('falls back to filing otherIncome for gross distribution', () => {
    const result = extractionTo1099RRecipient([], makeFiling({ otherIncome: 20000 }))
    expect(result.grossDistribution).toBe(20000)
  })

  it('handles empty extraction array', () => {
    const result = extractionTo1099RRecipient([], makeFiling())
    expect(result.taxableAmount).toBeUndefined()
    expect(result.federalTaxWithheld).toBeUndefined()
    expect(result.distributionCode).toBeUndefined()
  })
})

describe('extractionTo1099KRecipient', () => {
  const kFields: ExtractionField[] = [
    makeField('Gross Amount (Box 1a)', '25000.00'),
    makeField('Card Not Present Transactions (Box 1b)', '18000.00'),
    makeField('Number of Payment Transactions (Box 2)', '350'),
    makeField('Federal Income Tax Withheld (Box 4)', '5000.00'),
  ]

  it('maps extraction fields to 1099-K recipient input', () => {
    const result = extractionTo1099KRecipient(kFields, makeFiling())
    expect(result.grossAmount).toBe(25000)
    expect(result.cardNotPresentTransactions).toBe(18000)
    expect(result.numberOfPaymentTransactions).toBe(350)
    expect(result.federalTaxWithheld).toBe(5000)
  })

  it('uses filing data for personal info', () => {
    const result = extractionTo1099KRecipient(kFields, makeFiling())
    expect(result.tin).toBe('123456789')
    expect(result.name).toBe('Jane Doe')
  })

  it('falls back to filing otherIncome for gross amount', () => {
    const result = extractionTo1099KRecipient([], makeFiling({ otherIncome: 15000 }))
    expect(result.grossAmount).toBe(15000)
  })

  it('handles empty extraction array', () => {
    const result = extractionTo1099KRecipient([], makeFiling())
    expect(result.cardNotPresentTransactions).toBeUndefined()
    expect(result.numberOfPaymentTransactions).toBeUndefined()
    expect(result.federalTaxWithheld).toBeUndefined()
  })
})

describe('extractionTo1098Recipient', () => {
  const mortgageFields: ExtractionField[] = [
    makeField('Mortgage Interest Received (Box 1)', '12000.00'),
    makeField('Points Paid (Box 2)', '2500.00'),
    makeField('Mortgage Insurance Premiums (Box 5)', '1200.00'),
  ]

  it('maps extraction fields to 1098 recipient input', () => {
    const result = extractionTo1098Recipient(mortgageFields, makeFiling())
    expect(result.mortgageInterestReceived).toBe(12000)
    expect(result.pointsPaid).toBe(2500)
    expect(result.mortgageInsurancePremiums).toBe(1200)
  })

  it('uses filing data for personal info', () => {
    const result = extractionTo1098Recipient(mortgageFields, makeFiling())
    expect(result.tin).toBe('123456789')
    expect(result.name).toBe('Jane Doe')
    expect(result.address1).toBe('100 Main St')
  })

  it('returns 0 for mortgage interest when no fields', () => {
    const result = extractionTo1098Recipient([], makeFiling())
    expect(result.mortgageInterestReceived).toBe(0)
  })

  it('handles empty extraction array', () => {
    const result = extractionTo1098Recipient([], makeFiling())
    expect(result.pointsPaid).toBeUndefined()
    expect(result.mortgageInsurancePremiums).toBeUndefined()
  })
})
