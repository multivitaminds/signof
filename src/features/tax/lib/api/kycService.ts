// ─── KYC Service ─────────────────────────────────────────────────────────
//
// TIN matching (VerifyTIN) and USPS address validation (ValidateAddress).
// Used to verify recipient/employee data before filing.

import type { TaxBanditClient } from '../taxBanditClient'

// ─── Response Types ──────────────────────────────────────────────────────

interface TinVerificationResponse {
  StatusCode: number
  StatusName: string
  TINMatchingResult: {
    IsValid: boolean
    TINType: string
    StatusCode: string
    StatusMessage: string
  }
}

interface AddressValidationResponse {
  StatusCode: number
  StatusName: string
  AddressResult: {
    IsValid: boolean
    CorrectedAddress: {
      Address1: string
      Address2: string
      City: string
      State: string
      ZipCode: string
      ZipPlus4: string
    }
    Footnotes: string[]
    DPVConfirmation: string
  }
}

// ─── Result Types ────────────────────────────────────────────────────────

export interface TinVerificationResult {
  isValid: boolean
  tinType: string
  statusCode: string
  statusMessage: string
}

export interface CorrectedAddress {
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  zipPlus4: string
}

export interface AddressValidationResult {
  isValid: boolean
  correctedAddress: CorrectedAddress
  footnotes: string[]
  dpvConfirmation: string
}

// ─── Address Input ───────────────────────────────────────────────────────

export interface AddressInput {
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
}

// ─── Service ─────────────────────────────────────────────────────────────

export interface KycService {
  verifyTin(tin: string, name: string): Promise<TinVerificationResult>
  validateAddress(address: AddressInput): Promise<AddressValidationResult>
}

export function createKycService(client: TaxBanditClient): KycService {
  return {
    async verifyTin(tin: string, name: string) {
      const result = await client.fetch<TinVerificationResponse>('TINMatching/Verify', {
        method: 'POST',
        body: {
          TIN: tin.replace(/[^\d]/g, ''),
          Name: name,
        },
      })
      return {
        isValid: result.TINMatchingResult.IsValid,
        tinType: result.TINMatchingResult.TINType,
        statusCode: result.TINMatchingResult.StatusCode,
        statusMessage: result.TINMatchingResult.StatusMessage,
      }
    },

    async validateAddress(address: AddressInput) {
      const result = await client.fetch<AddressValidationResponse>('Address/Validate', {
        method: 'POST',
        body: {
          Address1: address.address1,
          Address2: address.address2 ?? '',
          City: address.city,
          State: address.state,
          ZipCode: address.zip,
        },
      })
      return {
        isValid: result.AddressResult.IsValid,
        correctedAddress: {
          address1: result.AddressResult.CorrectedAddress.Address1,
          address2: result.AddressResult.CorrectedAddress.Address2,
          city: result.AddressResult.CorrectedAddress.City,
          state: result.AddressResult.CorrectedAddress.State,
          zip: result.AddressResult.CorrectedAddress.ZipCode,
          zipPlus4: result.AddressResult.CorrectedAddress.ZipPlus4,
        },
        footnotes: result.AddressResult.Footnotes ?? [],
        dpvConfirmation: result.AddressResult.DPVConfirmation,
      }
    },
  }
}
