// ─── Form 941 Service ────────────────────────────────────────────────────
//
// Employer's Quarterly Federal Tax Return.
// Reports income taxes, Social Security tax, and Medicare tax
// withheld from employees' paychecks.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form941Payload {
  SubmissionManifest: {
    TaxYear: string
    Quarter: string
  }
  ReturnHeader: {
    Business: {
      BusinessId: string
    }
  }
  ReturnData: {
    NumberOfEmployees: number
    WagesTipsComp: number
    FederalIncomeTaxWithheld: number
    WagesSubjectToSSTax: number
    QualifiedSickLeaveWages?: number
    QualifiedFamilyLeaveWages?: number
    TaxableSocialSecurityTips?: number
    TaxableMedicareWagesAndTips: number
    TotalTaxBeforeAdjustments: number
    AdjustmentForFractionsOfCents?: number
    AdjustmentForSickPay?: number
    AdjustmentForTipsAndLifeInsurance?: number
    TotalTaxAfterAdjustments: number
    TotalDeposits: number
    BalanceDue: number
    Overpayment?: number
    ApplyOverpaymentToNextReturn?: boolean
    MonthlyDeposits?: {
      Month1: number
      Month2: number
      Month3: number
    }
  }
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm941Service(client: TaxBanditClient): FormService<Form941Payload> {
  return createFormService<Form941Payload>(client, 'Form941')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm941Payload(data: {
  taxYear: string
  quarter: string
  businessId: string
  numberOfEmployees: number
  wagesTipsComp: number
  federalTaxWithheld: number
  socialSecurityWages: number
  medicareWages: number
  totalTaxBeforeAdjustments: number
  totalTaxAfterAdjustments: number
  totalDeposits: number
  balanceDue: number
  qualifiedSickLeaveWages?: number
  qualifiedFamilyLeaveWages?: number
  socialSecurityTips?: number
  adjustmentFractions?: number
  adjustmentSickPay?: number
  adjustmentTipsInsurance?: number
  overpayment?: number
  applyOverpayment?: boolean
  monthlyDeposits?: { month1: number; month2: number; month3: number }
}): Form941Payload {
  return {
    SubmissionManifest: {
      TaxYear: data.taxYear,
      Quarter: data.quarter,
    },
    ReturnHeader: {
      Business: {
        BusinessId: data.businessId,
      },
    },
    ReturnData: {
      NumberOfEmployees: data.numberOfEmployees,
      WagesTipsComp: data.wagesTipsComp,
      FederalIncomeTaxWithheld: data.federalTaxWithheld,
      WagesSubjectToSSTax: data.socialSecurityWages,
      QualifiedSickLeaveWages: data.qualifiedSickLeaveWages,
      QualifiedFamilyLeaveWages: data.qualifiedFamilyLeaveWages,
      TaxableSocialSecurityTips: data.socialSecurityTips,
      TaxableMedicareWagesAndTips: data.medicareWages,
      TotalTaxBeforeAdjustments: data.totalTaxBeforeAdjustments,
      AdjustmentForFractionsOfCents: data.adjustmentFractions,
      AdjustmentForSickPay: data.adjustmentSickPay,
      AdjustmentForTipsAndLifeInsurance: data.adjustmentTipsInsurance,
      TotalTaxAfterAdjustments: data.totalTaxAfterAdjustments,
      TotalDeposits: data.totalDeposits,
      BalanceDue: data.balanceDue,
      Overpayment: data.overpayment,
      ApplyOverpaymentToNextReturn: data.applyOverpayment,
      MonthlyDeposits: data.monthlyDeposits
        ? {
            Month1: data.monthlyDeposits.month1,
            Month2: data.monthlyDeposits.month2,
            Month3: data.monthlyDeposits.month3,
          }
        : undefined,
    },
  }
}
