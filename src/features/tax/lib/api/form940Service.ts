// ─── Form 940 Service ────────────────────────────────────────────────────
//
// Employer's Annual Federal Unemployment (FUTA) Tax Return.
// Reports FUTA tax owed on wages paid to employees.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form940Payload {
  SubmissionManifest: {
    TaxYear: string
  }
  ReturnHeader: {
    Business: {
      BusinessId: string
    }
  }
  ReturnData: {
    TypeOfReturn?: string
    IsAmended?: boolean
    IsSuccessorEmployer?: boolean
    FUTAState: string
    IsMultiState: boolean
    MultiStateCredits?: Array<{
      StateCode: string
      CreditReductionRate: number
    }>
    TotalPayments: number
    ExemptPayments?: number
    PaymentsOver7000?: number
    TotalTaxableWages: number
    FUTATax: number
    Adjustments?: number
    TotalFUTATaxAfterAdjustments: number
    TotalDeposits: number
    BalanceDue: number
    Overpayment?: number
    ApplyOverpaymentToNextReturn?: boolean
    QuarterlyLiabilities?: {
      Q1: number
      Q2: number
      Q3: number
      Q4: number
    }
  }
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm940Service(client: TaxBanditClient): FormService<Form940Payload> {
  return createFormService<Form940Payload>(client, 'Form940')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm940Payload(data: {
  taxYear: string
  businessId: string
  futaState: string
  isMultiState?: boolean
  multiStateCredits?: Array<{ stateCode: string; creditReductionRate: number }>
  totalPayments: number
  exemptPayments?: number
  paymentsOver7000?: number
  totalTaxableWages: number
  futaTax: number
  adjustments?: number
  totalFutaTaxAfterAdjustments: number
  totalDeposits: number
  balanceDue: number
  overpayment?: number
  applyOverpayment?: boolean
  quarterlyLiabilities?: { q1: number; q2: number; q3: number; q4: number }
  typeOfReturn?: string
  isAmended?: boolean
  isSuccessorEmployer?: boolean
}): Form940Payload {
  return {
    SubmissionManifest: {
      TaxYear: data.taxYear,
    },
    ReturnHeader: {
      Business: {
        BusinessId: data.businessId,
      },
    },
    ReturnData: {
      TypeOfReturn: data.typeOfReturn,
      IsAmended: data.isAmended,
      IsSuccessorEmployer: data.isSuccessorEmployer,
      FUTAState: data.futaState,
      IsMultiState: data.isMultiState ?? false,
      MultiStateCredits: data.multiStateCredits?.map((c) => ({
        StateCode: c.stateCode,
        CreditReductionRate: c.creditReductionRate,
      })),
      TotalPayments: data.totalPayments,
      ExemptPayments: data.exemptPayments,
      PaymentsOver7000: data.paymentsOver7000,
      TotalTaxableWages: data.totalTaxableWages,
      FUTATax: data.futaTax,
      Adjustments: data.adjustments,
      TotalFUTATaxAfterAdjustments: data.totalFutaTaxAfterAdjustments,
      TotalDeposits: data.totalDeposits,
      BalanceDue: data.balanceDue,
      Overpayment: data.overpayment,
      ApplyOverpaymentToNextReturn: data.applyOverpayment,
      QuarterlyLiabilities: data.quarterlyLiabilities
        ? {
            Q1: data.quarterlyLiabilities.q1,
            Q2: data.quarterlyLiabilities.q2,
            Q3: data.quarterlyLiabilities.q3,
            Q4: data.quarterlyLiabilities.q4,
          }
        : undefined,
    },
  }
}
