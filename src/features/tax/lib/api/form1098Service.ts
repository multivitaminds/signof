// ─── 1098 Service ────────────────────────────────────────────────────────
//
// Mortgage Interest Statement reporting to the IRS.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form1098Recipient {
  RecipientId?: string
  RecipientTIN: string
  RecipientName: string
  Address1: string
  Address2?: string
  City: string
  State: string
  ZipCode: string
  MortgageInterestReceived: number
  PointsPaid?: number
  OutstandingMortgagePrincipal?: number
  MortgageOriginationDate?: string
  MortgageInsurancePremiums?: number
  PropertyAddress?: string
  NumberOfProperties?: number
}

export interface Form1098Payload {
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
  ReturnData: Form1098Recipient[]
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm1098Service(client: TaxBanditClient): FormService<Form1098Payload> {
  return createFormService<Form1098Payload>(client, 'Form1098')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm1098Payload(data: {
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
    mortgageInterestReceived: number
    pointsPaid?: number
    outstandingPrincipal?: number
    originationDate?: string
    mortgageInsurancePremiums?: number
    propertyAddress?: string
    numberOfProperties?: number
  }>
}): Form1098Payload {
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
      MortgageInterestReceived: r.mortgageInterestReceived,
      PointsPaid: r.pointsPaid,
      OutstandingMortgagePrincipal: r.outstandingPrincipal,
      MortgageOriginationDate: r.originationDate,
      MortgageInsurancePremiums: r.mortgageInsurancePremiums,
      PropertyAddress: r.propertyAddress,
      NumberOfProperties: r.numberOfProperties,
    })),
  }
}
