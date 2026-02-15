// ─── Form 1095-C Service ─────────────────────────────────────────────────
//
// Employer-Provided Health Insurance Offer and Coverage.
// ALEs (50+ full-time employees) must file 1095-C for each
// full-time employee to report health coverage offers.

import { createFormService } from './formService'
import type { FormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

// ─── Payload Types ───────────────────────────────────────────────────────

export interface Form1095cMonthlyInfo {
  Month: string
  OfferOfCoverage: string
  EmployeeShareLowestCostMonthlyPremium?: number
  SafeHarborCode?: string
  CoverageCode?: string
}

export interface Form1095cEmployee {
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
  AllYearCoverageOfferCode?: string
  AllYearEmployeeShareAmount?: number
  AllYearSafeHarborCode?: string
  AllYearCoverageCode?: string
  MonthlyInfo?: Form1095cMonthlyInfo[]
  CoveredIndividuals?: Array<{
    SSN?: string
    DOB?: string
    FirstName: string
    LastName: string
    IsAllYearCovered: boolean
    MonthsCovered?: string[]
  }>
}

export interface Form1095cPayload {
  SubmissionManifest: {
    TaxYear: string
  }
  ReturnHeader: {
    Business: {
      BusinessId: string
    }
  }
  ReturnData: Form1095cEmployee[]
}

// ─── Service Factory ─────────────────────────────────────────────────────

export function createForm1095cService(client: TaxBanditClient): FormService<Form1095cPayload> {
  return createFormService<Form1095cPayload>(client, 'Form1095C')
}

// ─── Payload Builder ─────────────────────────────────────────────────────

export function buildForm1095cPayload(data: {
  taxYear: string
  businessId: string
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
    allYearOfferCode?: string
    allYearShareAmount?: number
    allYearSafeHarborCode?: string
    allYearCoverageCode?: string
    monthlyInfo?: Array<{
      month: string
      offerCode: string
      premiumAmount?: number
      safeHarborCode?: string
      coverageCode?: string
    }>
    coveredIndividuals?: Array<{
      ssn?: string
      dob?: string
      firstName: string
      lastName: string
      isAllYearCovered: boolean
      monthsCovered?: string[]
    }>
  }>
}): Form1095cPayload {
  return {
    SubmissionManifest: {
      TaxYear: data.taxYear,
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
      AllYearCoverageOfferCode: e.allYearOfferCode,
      AllYearEmployeeShareAmount: e.allYearShareAmount,
      AllYearSafeHarborCode: e.allYearSafeHarborCode,
      AllYearCoverageCode: e.allYearCoverageCode,
      MonthlyInfo: e.monthlyInfo?.map((m) => ({
        Month: m.month,
        OfferOfCoverage: m.offerCode,
        EmployeeShareLowestCostMonthlyPremium: m.premiumAmount,
        SafeHarborCode: m.safeHarborCode,
        CoverageCode: m.coverageCode,
      })),
      CoveredIndividuals: e.coveredIndividuals?.map((ci) => ({
        SSN: ci.ssn?.replace(/[^\d]/g, ''),
        DOB: ci.dob,
        FirstName: ci.firstName,
        LastName: ci.lastName,
        IsAllYearCovered: ci.isAllYearCovered,
        MonthsCovered: ci.monthsCovered,
      })),
    })),
  }
}
