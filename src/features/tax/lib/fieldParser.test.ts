import { parseFieldsFromText, FIELD_PATTERNS } from './fieldParser'
import { TaxFormType as TaxFormTypeValues, ExtractionConfidence } from '../types'

describe('fieldParser', () => {
  describe('FIELD_PATTERNS', () => {
    it('has patterns for common form types', () => {
      expect(FIELD_PATTERNS[TaxFormTypeValues.W2]).toBeDefined()
      expect(FIELD_PATTERNS[TaxFormTypeValues.NEC1099]).toBeDefined()
      expect(FIELD_PATTERNS[TaxFormTypeValues.INT1099]).toBeDefined()
      expect(FIELD_PATTERNS[TaxFormTypeValues.Mortgage1098]).toBeDefined()
    })
  })

  describe('W-2 parsing', () => {
    const w2Text = `
      Form W-2 Wage and Tax Statement 2025
      Employer's name: Acme Corporation
      Employer's identification number (EIN): 12-3456789
      Wages, tips, other compensation    85,000.00
      Federal income tax withheld        14,500.00
      Social security wages              85,000.00
      Social security tax withheld        5,270.00
      Medicare wages and tips             85,000.00
      Medicare tax withheld                1,232.50
      State: CA
      State wages, tips                  85,000.00
      State income tax                    4,500.00
    `

    it('extracts employer name', () => {
      const fields = parseFieldsFromText(w2Text, TaxFormTypeValues.W2)
      const employer = fields.find((f) => f.key === 'Employer Name')
      expect(employer?.value).toBe('Acme Corporation')
      expect(employer?.confidence).toBe(ExtractionConfidence.High)
    })

    it('extracts employer EIN', () => {
      const fields = parseFieldsFromText(w2Text, TaxFormTypeValues.W2)
      const ein = fields.find((f) => f.key === 'Employer EIN')
      expect(ein?.value).toBe('12-3456789')
      expect(ein?.confidence).toBe(ExtractionConfidence.High)
    })

    it('extracts wages (Box 1)', () => {
      const fields = parseFieldsFromText(w2Text, TaxFormTypeValues.W2)
      const wages = fields.find((f) => f.key === 'Wages (Box 1)')
      expect(wages?.value).toBe('85000.00')
      expect(wages?.confidence).toBe(ExtractionConfidence.High)
    })

    it('extracts federal tax withheld (Box 2)', () => {
      const fields = parseFieldsFromText(w2Text, TaxFormTypeValues.W2)
      const fedTax = fields.find((f) => f.key === 'Federal Tax Withheld (Box 2)')
      expect(fedTax?.value).toBe('14500.00')
      expect(fedTax?.confidence).toBe(ExtractionConfidence.High)
    })

    it('extracts all 11 W-2 fields', () => {
      const fields = parseFieldsFromText(w2Text, TaxFormTypeValues.W2)
      expect(fields).toHaveLength(11)
    })

    it('sets confirmed to false for all fields', () => {
      const fields = parseFieldsFromText(w2Text, TaxFormTypeValues.W2)
      expect(fields.every((f) => f.confirmed === false)).toBe(true)
    })
  })

  describe('1099-NEC parsing', () => {
    const necText = `
      Form 1099-NEC Nonemployee Compensation
      Payer's name: Design Studio LLC
      Payer's TIN: 98-7654321
      Nonemployee compensation   12,000.00
      Federal income tax withheld      0.00
    `

    it('extracts payer name and compensation', () => {
      const fields = parseFieldsFromText(necText, TaxFormTypeValues.NEC1099)
      const payer = fields.find((f) => f.key === 'Payer Name')
      expect(payer?.value).toBe('Design Studio LLC')

      const comp = fields.find((f) => f.key === 'Nonemployee Compensation (Box 1)')
      expect(comp?.value).toBe('12000.00')
    })

    it('extracts 4 fields for 1099-NEC', () => {
      const fields = parseFieldsFromText(necText, TaxFormTypeValues.NEC1099)
      expect(fields).toHaveLength(4)
    })
  })

  describe('1099-INT parsing', () => {
    const intText = `
      Form 1099-INT Interest Income
      Payer's name: National Bank
      Interest income   450.00
      Early withdrawal penalty   0.00
      Federal income tax withheld   0.00
    `

    it('extracts interest income', () => {
      const fields = parseFieldsFromText(intText, TaxFormTypeValues.INT1099)
      const interest = fields.find((f) => f.key === 'Interest Income (Box 1)')
      expect(interest?.value).toBe('450.00')
    })
  })

  describe('1098 Mortgage parsing', () => {
    const mortgageText = `
      Form 1098 Mortgage Interest Statement
      Recipient's name: Wells Fargo Home Mortgage
      Mortgage interest received   8,200.00
      Points paid on purchase   0.00
      Mortgage insurance premiums   150.00
    `

    it('extracts mortgage interest', () => {
      const fields = parseFieldsFromText(mortgageText, TaxFormTypeValues.Mortgage1098)
      const interest = fields.find((f) => f.key === 'Mortgage Interest Received (Box 1)')
      expect(interest?.value).toBe('8200.00')
    })

    it('extracts lender name', () => {
      const fields = parseFieldsFromText(mortgageText, TaxFormTypeValues.Mortgage1098)
      const lender = fields.find((f) => f.key === 'Lender Name')
      expect(lender?.value).toBe('Wells Fargo Home Mortgage')
    })
  })

  describe('confidence scoring', () => {
    it('assigns high confidence to clean regex matches', () => {
      const text = 'Wages, tips, other compensation   50,000.00'
      const fields = parseFieldsFromText(text, TaxFormTypeValues.W2)
      const wages = fields.find((f) => f.key === 'Wages (Box 1)')
      expect(wages?.confidence).toBe(ExtractionConfidence.High)
    })

    it('assigns low confidence when no match found', () => {
      const text = 'This is just random garbage text with no tax info'
      const fields = parseFieldsFromText(text, TaxFormTypeValues.W2)
      const unmatched = fields.filter((f) => f.confidence === ExtractionConfidence.Low)
      expect(unmatched.length).toBeGreaterThan(0)
    })
  })

  describe('empty / garbage input', () => {
    it('returns all fields with low confidence for empty text', () => {
      const fields = parseFieldsFromText('', TaxFormTypeValues.W2)
      expect(fields).toHaveLength(11)
      expect(fields.every((f) => f.confidence === ExtractionConfidence.Low)).toBe(true)
    })

    it('returns empty array for unsupported form type', () => {
      const fields = parseFieldsFromText('some text', TaxFormTypeValues.W2C)
      expect(fields).toHaveLength(0)
    })
  })

  describe('number formatting', () => {
    it('handles dollar signs in values', () => {
      const text = 'Wages, tips, other compensation   $85,000.00'
      const fields = parseFieldsFromText(text, TaxFormTypeValues.W2)
      const wages = fields.find((f) => f.key === 'Wages (Box 1)')
      expect(wages?.value).toBe('85000.00')
    })

    it('handles values without decimals', () => {
      const text = 'Wages, tips, other compensation   85000'
      const fields = parseFieldsFromText(text, TaxFormTypeValues.W2)
      const wages = fields.find((f) => f.key === 'Wages (Box 1)')
      expect(wages?.value).toBe('85000.00')
    })

    it('handles box number references', () => {
      const text = 'Box 1: 75000.50'
      const fields = parseFieldsFromText(text, TaxFormTypeValues.W2)
      const wages = fields.find((f) => f.key === 'Wages (Box 1)')
      expect(wages?.value).toBe('75000.50')
    })
  })
})
