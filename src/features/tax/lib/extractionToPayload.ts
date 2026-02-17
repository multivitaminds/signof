// ─── Extraction → Payload Bridge ─────────────────────────────────────────
//
// Maps confirmed ExtractionField[] from the extraction pipeline to the
// input shapes expected by the existing TaxBandits payload builders.
// Falls back to TaxFiling data when extraction fields are sparse.

import type { ExtractionField, TaxFiling } from '../types'
import type { BusinessData } from './api/businessService'

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Find the first extraction field whose key matches the pattern */
export function getFieldValue(fields: ExtractionField[], keyPattern: RegExp): string {
  const field = fields.find((f) => keyPattern.test(f.key))
  return field?.value ?? ''
}

/** Parse a numeric value from extraction fields, handling $, commas, etc. */
export function getNumericValue(fields: ExtractionField[], keyPattern: RegExp): number {
  const raw = getFieldValue(fields, keyPattern)
  if (!raw) return 0
  const cleaned = raw.replace(/[$,\s]/g, '')
  const parsed = parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

// ─── W-2 Employee Mapping ─────────────────────────────────────────────────

/** Input shape matching buildFormW2Payload's employees array items */
export interface W2EmployeeInput {
  ssn: string
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  wages: number
  federalTaxWithheld: number
  socialSecurityWages: number
  socialSecurityTax: number
  medicareWages: number
  medicareTax: number
  socialSecurityTips?: number
  allocatedTips?: number
}

/**
 * Maps W-2 extraction fields to the employee input shape for buildFormW2Payload.
 * Falls back to TaxFiling data for personal info when extraction is incomplete.
 */
export function extractionToW2Employee(
  fields: ExtractionField[],
  filing: TaxFiling
): W2EmployeeInput {
  const wages = getNumericValue(fields, /wages.*box\s*1/i) || filing.wages
  const socialSecurityWages = getNumericValue(fields, /social\s*security\s*wages.*box\s*3/i)

  return {
    ssn: filing.ssn.replace(/[^\d]/g, ''),
    firstName: filing.firstName,
    lastName: filing.lastName,
    address1: filing.address.street,
    address2: filing.address.apt || undefined,
    city: filing.address.city,
    state: filing.address.state,
    zip: filing.address.zip,
    wages,
    federalTaxWithheld:
      getNumericValue(fields, /federal\s*(income\s*)?tax\s*withheld.*box\s*2/i) ||
      filing.withheld,
    socialSecurityWages: socialSecurityWages || wages,
    socialSecurityTax: getNumericValue(fields, /social\s*security\s*tax.*box\s*4/i),
    medicareWages:
      getNumericValue(fields, /medicare\s*wages.*box\s*5/i) || socialSecurityWages || wages,
    medicareTax: getNumericValue(fields, /medicare\s*tax.*box\s*6/i),
    socialSecurityTips: getNumericValue(fields, /social\s*security\s*tips.*box\s*7/i) || undefined,
    allocatedTips: getNumericValue(fields, /allocated\s*tips.*box\s*8/i) || undefined,
  }
}

// ─── 1099-NEC Recipient Mapping ───────────────────────────────────────────

/** Input shape matching buildForm1099NecPayload's recipients array items */
export interface Nec1099RecipientInput {
  tin: string
  name: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  nonemployeeCompensation: number
  federalTaxWithheld?: number
}

/**
 * Maps 1099-NEC extraction fields to the recipient input shape for buildForm1099NecPayload.
 * Falls back to TaxFiling data for personal info when extraction is incomplete.
 */
export function extractionTo1099NecRecipient(
  fields: ExtractionField[],
  filing: TaxFiling
): Nec1099RecipientInput {
  return {
    tin: filing.ssn.replace(/[^\d]/g, ''),
    name: `${filing.firstName} ${filing.lastName}`.trim(),
    address1: filing.address.street,
    address2: filing.address.apt || undefined,
    city: filing.address.city,
    state: filing.address.state,
    zip: filing.address.zip,
    nonemployeeCompensation:
      getNumericValue(fields, /nonemployee\s*compensation.*box\s*1/i) || filing.otherIncome,
    federalTaxWithheld:
      getNumericValue(fields, /federal\s*(income\s*)?tax\s*withheld/i) || undefined,
  }
}

// ─── Business Data Mapping ────────────────────────────────────────────────

/**
 * Maps a TaxFiling to the BusinessData shape expected by createBusinessService.
 * For individual filers, the "business" is the person themselves.
 */
export function filingToBusinessData(filing: TaxFiling): BusinessData {
  const rawSsn = filing.ssn.replace(/[^\d]/g, '')
  return {
    businessName: `${filing.firstName} ${filing.lastName}`.trim(),
    taxIdType: 'SSN',
    tin: rawSsn,
    isEIN: false,
    contactName: `${filing.firstName} ${filing.lastName}`.trim(),
    phone: filing.phone,
    email: filing.email,
    address1: filing.address.street,
    address2: filing.address.apt || undefined,
    city: filing.address.city,
    state: filing.address.state,
    zip: filing.address.zip,
  }
}
