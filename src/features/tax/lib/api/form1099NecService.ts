// ─── 1099-NEC Service ────────────────────────────────────────────────────
//
// Nonemployee Compensation reporting to the IRS.
// Used for freelance/contract payments >= $600 in a tax year.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form1099NecRecipient {
  RecipientId?: string
  RecipientTIN: string
  RecipientName: string
  Address1: string
  Address2?: string
  City: string
  State: string
  ZipCode: string
  NEC: number
  IsFederalTaxWithheld: boolean
  FederalTaxWithheld: number
  IsStateFiling: boolean
  StateCode?: string
  StateIncome?: number
  StateTaxWithheld?: number
}

export interface Form1099NecPayload {
  SubmissionManifest: {
    TaxYear: string
    IsFederalFiling: boolean
    IsStateFiling: boolean
  }
  ReturnHeader: {
    Business: {
      BusinessId: string
    }
  }
  ReturnData: Form1099NecRecipient[]
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm1099NecService(client: TaxBanditClient): FormService<Form1099NecPayload> {
  return createFormService<Form1099NecPayload>(client, 'Form1099NEC')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm1099NecPayload(data: {
  taxYear: string
  businessId: string
  isFederalFiling?: boolean
  isStateFiling?: boolean
  recipients: Array<{
    recipientId?: string
    tin: string
    name: string
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
    nonemployeeCompensation: number
    federalTaxWithheld?: number
    stateCode?: string
    stateIncome?: number
    stateTaxWithheld?: number
  }>
}): Form1099NecPayload {
  return {
    SubmissionManifest: {
      TaxYear: data.taxYear,
      IsFederalFiling: data.isFederalFiling ?? true,
      IsStateFiling: data.isStateFiling ?? false,
    },
    ReturnHeader: {
      Business: {
        BusinessId: data.businessId,
      },
    },
    ReturnData: data.recipients.map((r) => ({
      RecipientId: r.recipientId,
      RecipientTIN: r.tin.replace(/[^\d]/g, ''),
      RecipientName: r.name,
      Address1: r.address1,
      Address2: r.address2,
      City: r.city,
      State: r.state,
      ZipCode: r.zip,
      NEC: r.nonemployeeCompensation,
      IsFederalTaxWithheld: (r.federalTaxWithheld ?? 0) > 0,
      FederalTaxWithheld: r.federalTaxWithheld ?? 0,
      IsStateFiling: Boolean(r.stateCode),
      StateCode: r.stateCode,
      StateIncome: r.stateIncome,
      StateTaxWithheld: r.stateTaxWithheld,
    })),
  }
}
