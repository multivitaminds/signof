// ─── 1098-T Service ──────────────────────────────────────────────────────
//
// Tuition Statement reporting to the IRS.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form1098TRecipient {
  RecipientId?: string
  RecipientTIN: string
  RecipientName: string
  Address1: string
  Address2?: string
  City: string
  State: string
  ZipCode: string
  PaymentsReceivedForTuition?: number
  AmountsForAdjustments?: number
  ScholarshipsOrGrants?: number
  AdjustmentsToScholarships?: number
  InsuranceContractReimbursements?: number
  IsHalfTime?: boolean
  IsGraduate?: boolean
}

export interface Form1098TPayload {
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
  ReturnData: Form1098TRecipient[]
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm1098TService(client: TaxBanditClient): FormService<Form1098TPayload> {
  return createFormService<Form1098TPayload>(client, 'Form1098T')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm1098TPayload(data: {
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
    paymentsForTuition?: number
    amountsForAdjustments?: number
    scholarshipsOrGrants?: number
    adjustmentsToScholarships?: number
    insuranceReimbursements?: number
    isHalfTime?: boolean
    isGraduate?: boolean
  }>
}): Form1098TPayload {
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
      PaymentsReceivedForTuition: r.paymentsForTuition,
      AmountsForAdjustments: r.amountsForAdjustments,
      ScholarshipsOrGrants: r.scholarshipsOrGrants,
      AdjustmentsToScholarships: r.adjustmentsToScholarships,
      InsuranceContractReimbursements: r.insuranceReimbursements,
      IsHalfTime: r.isHalfTime,
      IsGraduate: r.isGraduate,
    })),
  }
}
