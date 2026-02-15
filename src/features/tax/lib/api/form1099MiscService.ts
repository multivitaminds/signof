// ─── 1099-MISC Service ───────────────────────────────────────────────────
//
// Miscellaneous Income reporting: rents, royalties, prizes, awards,
// crop insurance, fishing boat proceeds, attorney payments, etc.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form1099MiscRecipient {
  RecipientId?: string
  RecipientTIN: string
  RecipientName: string
  Address1: string
  Address2?: string
  City: string
  State: string
  ZipCode: string
  Rents?: number
  Royalties?: number
  OtherIncome?: number
  FishingBoatProceeds?: number
  MedicalHealthCarePayments?: number
  SubstitutePayments?: number
  CropInsuranceProceeds?: number
  AttorneyProceeds?: number
  FederalTaxWithheld?: number
  IsStateFiling: boolean
  StateCode?: string
  StateIncome?: number
  StateTaxWithheld?: number
}

export interface Form1099MiscPayload {
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
  ReturnData: Form1099MiscRecipient[]
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm1099MiscService(client: TaxBanditClient): FormService<Form1099MiscPayload> {
  return createFormService<Form1099MiscPayload>(client, 'Form1099MISC')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm1099MiscPayload(data: {
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
    rents?: number
    royalties?: number
    otherIncome?: number
    fishingBoatProceeds?: number
    medicalPayments?: number
    substitutePayments?: number
    cropInsurance?: number
    attorneyProceeds?: number
    federalTaxWithheld?: number
    stateCode?: string
    stateIncome?: number
    stateTaxWithheld?: number
  }>
}): Form1099MiscPayload {
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
      Rents: r.rents,
      Royalties: r.royalties,
      OtherIncome: r.otherIncome,
      FishingBoatProceeds: r.fishingBoatProceeds,
      MedicalHealthCarePayments: r.medicalPayments,
      SubstitutePayments: r.substitutePayments,
      CropInsuranceProceeds: r.cropInsurance,
      AttorneyProceeds: r.attorneyProceeds,
      FederalTaxWithheld: r.federalTaxWithheld,
      IsStateFiling: Boolean(r.stateCode),
      StateCode: r.stateCode,
      StateIncome: r.stateIncome,
      StateTaxWithheld: r.stateTaxWithheld,
    })),
  }
}
