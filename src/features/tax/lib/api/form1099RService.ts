// ─── 1099-R Service ──────────────────────────────────────────────────────
//
// Retirement Distributions reporting to the IRS.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form1099RRecipient {
  RecipientId?: string
  RecipientTIN: string
  RecipientName: string
  Address1: string
  Address2?: string
  City: string
  State: string
  ZipCode: string
  GrossDistribution: number
  TaxableAmount?: number
  TaxableAmountNotDetermined?: boolean
  CapitalGain?: number
  IsFederalTaxWithheld: boolean
  FederalTaxWithheld: number
  DistributionCode?: string
  IRASEPSimple?: boolean
  IsStateFiling: boolean
  StateCode?: string
  StateIncome?: number
  StateTaxWithheld?: number
}

export interface Form1099RPayload {
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
  ReturnData: Form1099RRecipient[]
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm1099RService(client: TaxBanditClient): FormService<Form1099RPayload> {
  return createFormService<Form1099RPayload>(client, 'Form1099R')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm1099RPayload(data: {
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
    grossDistribution: number
    taxableAmount?: number
    taxableAmountNotDetermined?: boolean
    capitalGain?: number
    federalTaxWithheld?: number
    distributionCode?: string
    iraSepSimple?: boolean
    stateCode?: string
    stateIncome?: number
    stateTaxWithheld?: number
  }>
}): Form1099RPayload {
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
      GrossDistribution: r.grossDistribution,
      TaxableAmount: r.taxableAmount,
      TaxableAmountNotDetermined: r.taxableAmountNotDetermined,
      CapitalGain: r.capitalGain,
      IsFederalTaxWithheld: (r.federalTaxWithheld ?? 0) > 0,
      FederalTaxWithheld: r.federalTaxWithheld ?? 0,
      DistributionCode: r.distributionCode,
      IRASEPSimple: r.iraSepSimple,
      IsStateFiling: Boolean(r.stateCode),
      StateCode: r.stateCode,
      StateIncome: r.stateIncome,
      StateTaxWithheld: r.stateTaxWithheld,
    })),
  }
}
