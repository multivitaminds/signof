import type { ExtractionField, TaxFormType } from '../types'
import { ExtractionConfidence, TaxFormType as TaxFormTypeValues } from '../types'

// ─── Field Pattern Definitions ──────────────────────────────────────────

interface FieldPattern {
  key: string
  patterns: RegExp[]
  type: 'currency' | 'text' | 'ein' | 'state'
}

export const FIELD_PATTERNS: Partial<Record<TaxFormType, FieldPattern[]>> = {
  [TaxFormTypeValues.W2]: [
    {
      key: 'Employer Name',
      patterns: [/(?:employer['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i],
      type: 'text',
    },
    {
      key: 'Employer EIN',
      patterns: [/(?:employer['']?s?\s*(?:identification|EIN|ID)[^:\n]*[:.]?\s*)(\d{2}[- ]?\d{7})/i, /(\d{2}-\d{7})/],
      type: 'ein',
    },
    {
      key: 'Wages (Box 1)',
      patterns: [
        /(?:wages[,\s]*tips[,\s]*other\s*compensation)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Federal Tax Withheld (Box 2)',
      patterns: [
        /(?:federal\s*(?:income\s*)?tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*2)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Social Security Wages (Box 3)',
      patterns: [
        /(?:social\s*security\s*wages)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*3)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Social Security Tax (Box 4)',
      patterns: [
        /(?:social\s*security\s*tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*4)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Medicare Wages (Box 5)',
      patterns: [
        /(?:medicare\s*wages\s*(?:and\s*tips)?)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*5)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Medicare Tax (Box 6)',
      patterns: [
        /(?:medicare\s*tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*6)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'State (Box 15)',
      patterns: [
        /(?:state)\s*(?:box\s*15)?\s*[:.]?\s*([A-Z]{2})\b/i,
        /\b([A-Z]{2})\s+(?:state\s*(?:wages|income|tax))/i,
      ],
      type: 'state',
    },
    {
      key: 'State Income (Box 16)',
      patterns: [
        /(?:state\s*wages[,\s]*tips)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*16)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'State Tax Withheld (Box 17)',
      patterns: [
        /(?:state\s*(?:income\s*)?tax\s*(?:withheld)?)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*17)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.NEC1099]: [
    {
      key: 'Payer Name',
      patterns: [/(?:payer['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i],
      type: 'text',
    },
    {
      key: 'Payer TIN',
      patterns: [/(?:payer['']?s?\s*(?:TIN|identification)[^:\n]*[:.]?\s*)(\d{2}[- ]?\d{7})/i, /(\d{2}-\d{7})/],
      type: 'ein',
    },
    {
      key: 'Nonemployee Compensation (Box 1)',
      patterns: [
        /(?:nonemployee\s*compensation)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Federal Tax Withheld (Box 4)',
      patterns: [
        /(?:federal\s*(?:income\s*)?tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*4)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.MISC1099]: [
    {
      key: 'Payer Name',
      patterns: [/(?:payer['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i],
      type: 'text',
    },
    {
      key: 'Payer TIN',
      patterns: [/(\d{2}-\d{7})/],
      type: 'ein',
    },
    {
      key: 'Rents (Box 1)',
      patterns: [
        /(?:rents)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Royalties (Box 2)',
      patterns: [
        /(?:royalties)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*2)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Other Income (Box 3)',
      patterns: [
        /(?:other\s*income)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*3)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Federal Tax Withheld (Box 4)',
      patterns: [
        /(?:federal\s*(?:income\s*)?tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*4)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.INT1099]: [
    {
      key: 'Payer Name',
      patterns: [/(?:payer['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i],
      type: 'text',
    },
    {
      key: 'Interest Income (Box 1)',
      patterns: [
        /(?:interest\s*income)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Early Withdrawal Penalty (Box 2)',
      patterns: [
        /(?:early\s*withdrawal\s*penalty)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*2)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Interest on US Savings Bonds (Box 3)',
      patterns: [
        /(?:(?:us|u\.s\.)\s*savings\s*bonds)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*3)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Federal Tax Withheld (Box 4)',
      patterns: [
        /(?:federal\s*(?:income\s*)?tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*4)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.DIV1099]: [
    {
      key: 'Payer Name',
      patterns: [/(?:payer['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i],
      type: 'text',
    },
    {
      key: 'Total Ordinary Dividends (Box 1a)',
      patterns: [
        /(?:(?:total\s*)?ordinary\s*dividends)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1a)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Qualified Dividends (Box 1b)',
      patterns: [
        /(?:qualified\s*dividends)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1b)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Total Capital Gain Distributions (Box 2a)',
      patterns: [
        /(?:(?:total\s*)?capital\s*gain\s*dist)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*2a)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Federal Tax Withheld (Box 4)',
      patterns: [
        /(?:federal\s*(?:income\s*)?tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*4)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.Mortgage1098]: [
    {
      key: 'Lender Name',
      patterns: [
        /(?:(?:recipient|lender)['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i,
      ],
      type: 'text',
    },
    {
      key: 'Mortgage Interest Received (Box 1)',
      patterns: [
        /(?:mortgage\s*interest\s*received)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Points Paid (Box 2)',
      patterns: [
        /(?:points\s*paid)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*2)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Mortgage Insurance Premiums (Box 5)',
      patterns: [
        /(?:mortgage\s*insurance\s*premiums)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*5)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.ACA1095A]: [
    {
      key: 'Marketplace Identifier',
      patterns: [/(?:marketplace\s*identifier)\s*[:.]?\s*([A-Za-z0-9-]+)/i],
      type: 'text',
    },
    {
      key: 'Policy Number',
      patterns: [/(?:policy\s*(?:number|no\.?))\s*[:.]?\s*([A-Za-z0-9-]+)/i],
      type: 'text',
    },
    {
      key: 'Monthly Premium (Column A)',
      patterns: [
        /(?:monthly\s*(?:enrollment\s*)?premium)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:column\s*a)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Monthly SLCSP Premium (Column B)',
      patterns: [
        /(?:slcsp\s*premium)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:column\s*b)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Monthly APTC (Column C)',
      patterns: [
        /(?:advance\s*(?:payment|premium)\s*(?:of\s*)?(?:the\s*)?(?:premium\s*)?tax\s*credit|aptc)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:column\s*c)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.R1099]: [
    {
      key: 'Payer Name',
      patterns: [/(?:payer['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i],
      type: 'text',
    },
    {
      key: 'Gross Distribution (Box 1)',
      patterns: [
        /(?:gross\s*distribution)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Taxable Amount (Box 2a)',
      patterns: [
        /(?:taxable\s*amount)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*2a)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Federal Tax Withheld (Box 4)',
      patterns: [
        /(?:federal\s*(?:income\s*)?tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*4)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Distribution Code (Box 7)',
      patterns: [
        /(?:distribution\s*code)\s*[:.]?\s*([A-Za-z0-9])/i,
        /(?:box\s*7)\s*[:.]?\s*([A-Za-z0-9])/i,
      ],
      type: 'text',
    },
  ],
  [TaxFormTypeValues.K1099]: [
    {
      key: 'Filer Name',
      patterns: [/(?:filer['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i],
      type: 'text',
    },
    {
      key: 'Gross Amount (Box 1a)',
      patterns: [
        /(?:gross\s*amount)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1a)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Card Not Present Transactions (Box 1b)',
      patterns: [
        /(?:card\s*not\s*present)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1b)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Federal Tax Withheld (Box 4)',
      patterns: [
        /(?:federal\s*(?:income\s*)?tax\s*withheld)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*4)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.E1098]: [
    {
      key: 'Lender Name',
      patterns: [
        /(?:(?:recipient|lender)['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i,
      ],
      type: 'text',
    },
    {
      key: 'Student Loan Interest (Box 1)',
      patterns: [
        /(?:student\s*loan\s*interest)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
  [TaxFormTypeValues.T1098]: [
    {
      key: 'Institution Name',
      patterns: [
        /(?:(?:filer|institution)['']?s?\s*name[^:\n]*[:.]?\s*)([A-Za-z][A-Za-z0-9 &.,'-]{2,})/i,
      ],
      type: 'text',
    },
    {
      key: 'Payments Received for Tuition (Box 1)',
      patterns: [
        /(?:payments?\s*received\s*(?:for\s*)?(?:qualified\s*)?tuition)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*1)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
    {
      key: 'Scholarships or Grants (Box 5)',
      patterns: [
        /(?:scholarships?\s*(?:or\s*)?grants?)\D{0,30}([\d,]+\.?\d*)/i,
        /(?:box\s*5)\D{0,20}(?:\$\s*)?([\d,]+\.?\d*)/i,
      ],
      type: 'currency',
    },
  ],
}

// ─── Helpers ────────────────────────────────────────────────────────────

function cleanCurrencyValue(raw: string): string {
  // Remove commas and dollar signs, ensure 2 decimal places
  const cleaned = raw.replace(/[$,]/g, '').trim()
  const num = parseFloat(cleaned)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

function matchField(text: string, fieldPattern: FieldPattern): { value: string; confidence: ExtractionConfidence } {
  for (const pattern of fieldPattern.patterns) {
    const match = pattern.exec(text)
    if (match?.[1]) {
      const rawValue = match[1].trim()

      if (fieldPattern.type === 'currency') {
        const cleaned = cleanCurrencyValue(rawValue)
        if (cleaned !== '0.00') {
          return { value: cleaned, confidence: ExtractionConfidence.High }
        }
        // Matched but value was 0 — could be real
        return { value: cleaned, confidence: ExtractionConfidence.Medium }
      }

      if (fieldPattern.type === 'ein') {
        // Validate EIN format: XX-XXXXXXX
        const normalized = rawValue.replace(/\s/g, '')
        if (/^\d{2}-?\d{7}$/.test(normalized)) {
          const formatted = normalized.includes('-') ? normalized : `${normalized.slice(0, 2)}-${normalized.slice(2)}`
          return { value: formatted, confidence: ExtractionConfidence.High }
        }
        return { value: rawValue, confidence: ExtractionConfidence.Medium }
      }

      if (fieldPattern.type === 'state') {
        const upper = rawValue.toUpperCase()
        return { value: upper, confidence: ExtractionConfidence.High }
      }

      // Text type
      if (rawValue.length > 1) {
        return { value: rawValue, confidence: ExtractionConfidence.High }
      }
      return { value: rawValue, confidence: ExtractionConfidence.Medium }
    }
  }

  // No match found
  return { value: '', confidence: ExtractionConfidence.Low }
}

// ─── Main Parser ────────────────────────────────────────────────────────

/**
 * Parse raw text (from PDF or OCR) into structured ExtractionField[].
 * Uses regex patterns specific to each form type to identify field values.
 */
export function parseFieldsFromText(text: string, formType: TaxFormType): ExtractionField[] {
  const patterns = FIELD_PATTERNS[formType]
  if (!patterns) {
    return []
  }

  return patterns.map((fieldPattern) => {
    const { value, confidence } = matchField(text, fieldPattern)
    return {
      key: fieldPattern.key,
      value: value || (fieldPattern.type === 'currency' ? '0.00' : ''),
      confidence,
      confirmed: false,
    }
  })
}
