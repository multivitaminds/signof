// ─── 1099-K Service ──────────────────────────────────────────────────────
//
// Payment Card and Third-Party Network Transactions reporting to the IRS.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form1099KRecipient {
  RecipientId?: string
  RecipientTIN: string
  RecipientName: string
  Address1: string
  Address2?: string
  City: string
  State: string
  ZipCode: string
  GrossAmount: number
  CardNotPresentTransactions?: number
  NumberOfPaymentTransactions?: number
  IsFederalTaxWithheld: boolean
  FederalTaxWithheld: number
  MerchantCategoryCode?: string
  IsStateFiling: boolean
  StateCode?: string
  StateIncome?: number
  StateTaxWithheld?: number
}

export interface Form1099KPayload {
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
  ReturnData: Form1099KRecipient[]
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm1099KService(client: TaxBanditClient): FormService<Form1099KPayload> {
  return createFormService<Form1099KPayload>(client, 'Form1099K')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm1099KPayload(data: {
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
    grossAmount: number
    cardNotPresentTransactions?: number
    numberOfPaymentTransactions?: number
    federalTaxWithheld?: number
    merchantCategoryCode?: string
    stateCode?: string
    stateIncome?: number
    stateTaxWithheld?: number
  }>
}): Form1099KPayload {
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
      GrossAmount: r.grossAmount,
      CardNotPresentTransactions: r.cardNotPresentTransactions,
      NumberOfPaymentTransactions: r.numberOfPaymentTransactions,
      IsFederalTaxWithheld: (r.federalTaxWithheld ?? 0) > 0,
      FederalTaxWithheld: r.federalTaxWithheld ?? 0,
      MerchantCategoryCode: r.merchantCategoryCode,
      IsStateFiling: Boolean(r.stateCode),
      StateCode: r.stateCode,
      StateIncome: r.stateIncome,
      StateTaxWithheld: r.stateTaxWithheld,
    })),
  }
}
