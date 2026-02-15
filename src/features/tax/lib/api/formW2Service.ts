// ─── W-2 Service ─────────────────────────────────────────────────────────
//
// Wage and Tax Statement reporting. Employers file W-2s for each
// employee who received wages, tips, or other compensation.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface FormW2Employee {
  EmployeeId?: string
  SSN: string
  FirstName: string
  MiddleName?: string
  LastName: string
  Suffix?: string
  Address1: string
  Address2?: string
  City: string
  State: string
  ZipCode: string
  WagesTipsOtherComp: number
  FederalIncomeTaxWithheld: number
  SocialSecurityWages: number
  SocialSecurityTaxWithheld: number
  MedicareWagesAndTips: number
  MedicareTaxWithheld: number
  SocialSecurityTips?: number
  AllocatedTips?: number
  DependentCareBenefits?: number
  NonQualifiedPlans?: number
  IsStatutoryEmployee?: boolean
  IsRetirementPlan?: boolean
  IsThirdPartySickPay?: boolean
  States?: Array<{
    StateCode: string
    StateWages: number
    StateTaxWithheld: number
    EmployerStateIdNumber: string
  }>
}

export interface FormW2Payload {
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
  ReturnData: FormW2Employee[]
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createFormW2Service(client: TaxBanditClient): FormService<FormW2Payload> {
  return createFormService<FormW2Payload>(client, 'FormW2')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildFormW2Payload(data: {
  taxYear: string
  businessId: string
  isFederalFiling?: boolean
  isStateFiling?: boolean
  employees: Array<{
    employeeId?: string
    ssn: string
    firstName: string
    middleName?: string
    lastName: string
    suffix?: string
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
    dependentCareBenefits?: number
    nonQualifiedPlans?: number
    isStatutoryEmployee?: boolean
    isRetirementPlan?: boolean
    isThirdPartySickPay?: boolean
    states?: Array<{
      stateCode: string
      stateWages: number
      stateTaxWithheld: number
      employerStateId: string
    }>
  }>
}): FormW2Payload {
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
    ReturnData: data.employees.map((e) => ({
      EmployeeId: e.employeeId,
      SSN: e.ssn.replace(/[^\d]/g, ''),
      FirstName: e.firstName,
      MiddleName: e.middleName,
      LastName: e.lastName,
      Suffix: e.suffix,
      Address1: e.address1,
      Address2: e.address2,
      City: e.city,
      State: e.state,
      ZipCode: e.zip,
      WagesTipsOtherComp: e.wages,
      FederalIncomeTaxWithheld: e.federalTaxWithheld,
      SocialSecurityWages: e.socialSecurityWages,
      SocialSecurityTaxWithheld: e.socialSecurityTax,
      MedicareWagesAndTips: e.medicareWages,
      MedicareTaxWithheld: e.medicareTax,
      SocialSecurityTips: e.socialSecurityTips,
      AllocatedTips: e.allocatedTips,
      DependentCareBenefits: e.dependentCareBenefits,
      NonQualifiedPlans: e.nonQualifiedPlans,
      IsStatutoryEmployee: e.isStatutoryEmployee,
      IsRetirementPlan: e.isRetirementPlan,
      IsThirdPartySickPay: e.isThirdPartySickPay,
      States: e.states?.map((s) => ({
        StateCode: s.stateCode,
        StateWages: s.stateWages,
        StateTaxWithheld: s.stateTaxWithheld,
        EmployerStateIdNumber: s.employerStateId,
      })),
    })),
  }
}
