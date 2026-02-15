import { buildForm1099NecPayload } from './form1099NecService'
import { buildForm1099MiscPayload } from './form1099MiscService'
import { buildFormW2Payload } from './formW2Service'
import { buildForm941Payload } from './form941Service'
import { buildForm940Payload } from './form940Service'
import { buildForm1095cPayload } from './form1095cService'

// ─── 1099-NEC Payload Builder ──────────────────────────────────────────────

describe('buildForm1099NecPayload', () => {
  it('builds a valid payload with required fields', () => {
    const result = buildForm1099NecPayload({
      taxYear: '2025',
      businessId: 'biz-1',
      recipients: [
        {
          tin: '123-45-6789',
          name: 'Jane Doe',
          address1: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
          nonemployeeCompensation: 5000,
        },
      ],
    })

    expect(result.SubmissionManifest.TaxYear).toBe('2025')
    expect(result.SubmissionManifest.IsFederalFiling).toBe(true)
    expect(result.SubmissionManifest.IsStateFiling).toBe(false)
    expect(result.ReturnHeader.Business.BusinessId).toBe('biz-1')
    expect(result.ReturnData).toHaveLength(1)
    expect(result.ReturnData[0]!.RecipientTIN).toBe('123456789')
    expect(result.ReturnData[0]!.NEC).toBe(5000)
    expect(result.ReturnData[0]!.IsFederalTaxWithheld).toBe(false)
    expect(result.ReturnData[0]!.FederalTaxWithheld).toBe(0)
  })

  it('strips non-digit characters from TIN', () => {
    const result = buildForm1099NecPayload({
      taxYear: '2025',
      businessId: 'biz-1',
      recipients: [
        {
          tin: '98-7654321',
          name: 'Test',
          address1: '1 St',
          city: 'NY',
          state: 'NY',
          zip: '10001',
          nonemployeeCompensation: 1000,
        },
      ],
    })

    expect(result.ReturnData[0]!.RecipientTIN).toBe('987654321')
  })

  it('sets IsStateFiling based on stateCode presence', () => {
    const result = buildForm1099NecPayload({
      taxYear: '2025',
      businessId: 'biz-1',
      recipients: [
        {
          tin: '111223333',
          name: 'State Filer',
          address1: '1 St',
          city: 'LA',
          state: 'CA',
          zip: '90001',
          nonemployeeCompensation: 2000,
          stateCode: 'CA',
          stateIncome: 2000,
        },
      ],
    })

    expect(result.ReturnData[0]!.IsStateFiling).toBe(true)
  })

  it('sets IsFederalTaxWithheld to true when federalTaxWithheld > 0', () => {
    const result = buildForm1099NecPayload({
      taxYear: '2025',
      businessId: 'biz-1',
      recipients: [
        {
          tin: '111223333',
          name: 'Withheld',
          address1: '1 St',
          city: 'LA',
          state: 'CA',
          zip: '90001',
          nonemployeeCompensation: 10000,
          federalTaxWithheld: 500,
        },
      ],
    })

    expect(result.ReturnData[0]!.IsFederalTaxWithheld).toBe(true)
    expect(result.ReturnData[0]!.FederalTaxWithheld).toBe(500)
  })
})

// ─── 1099-MISC Payload Builder ─────────────────────────────────────────────

describe('buildForm1099MiscPayload', () => {
  it('builds a valid payload with income fields', () => {
    const result = buildForm1099MiscPayload({
      taxYear: '2024',
      businessId: 'biz-2',
      recipients: [
        {
          tin: '222334444',
          name: 'John Smith',
          address1: '456 Oak Ave',
          city: 'Denver',
          state: 'CO',
          zip: '80201',
          rents: 12000,
          royalties: 3000,
        },
      ],
    })

    expect(result.SubmissionManifest.TaxYear).toBe('2024')
    expect(result.ReturnData[0]!.Rents).toBe(12000)
    expect(result.ReturnData[0]!.Royalties).toBe(3000)
    expect(result.ReturnData[0]!.RecipientTIN).toBe('222334444')
  })

  it('maps all optional income fields', () => {
    const result = buildForm1099MiscPayload({
      taxYear: '2025',
      businessId: 'biz-3',
      recipients: [
        {
          tin: '333445555',
          name: 'Misc Earner',
          address1: '1 St',
          city: 'NYC',
          state: 'NY',
          zip: '10001',
          otherIncome: 5000,
          fishingBoatProceeds: 1000,
          medicalPayments: 2000,
          substitutePayments: 500,
          cropInsurance: 300,
          attorneyProceeds: 8000,
        },
      ],
    })

    const r = result.ReturnData[0]!
    expect(r.OtherIncome).toBe(5000)
    expect(r.FishingBoatProceeds).toBe(1000)
    expect(r.MedicalHealthCarePayments).toBe(2000)
    expect(r.SubstitutePayments).toBe(500)
    expect(r.CropInsuranceProceeds).toBe(300)
    expect(r.AttorneyProceeds).toBe(8000)
  })

  it('defaults IsFederalFiling to true and IsStateFiling to false', () => {
    const result = buildForm1099MiscPayload({
      taxYear: '2025',
      businessId: 'biz-3',
      recipients: [
        {
          tin: '111111111',
          name: 'Test',
          address1: '1 St',
          city: 'A',
          state: 'CA',
          zip: '90001',
        },
      ],
    })

    expect(result.SubmissionManifest.IsFederalFiling).toBe(true)
    expect(result.SubmissionManifest.IsStateFiling).toBe(false)
  })
})

// ─── W-2 Payload Builder ───────────────────────────────────────────────────

describe('buildFormW2Payload', () => {
  it('builds a valid payload with employee data', () => {
    const result = buildFormW2Payload({
      taxYear: '2025',
      businessId: 'biz-4',
      employees: [
        {
          ssn: '555-66-7777',
          firstName: 'Alice',
          lastName: 'Johnson',
          address1: '789 Pine Rd',
          city: 'Seattle',
          state: 'WA',
          zip: '98101',
          wages: 85000,
          federalTaxWithheld: 14000,
          socialSecurityWages: 85000,
          socialSecurityTax: 5270,
          medicareWages: 85000,
          medicareTax: 1232.50,
        },
      ],
    })

    expect(result.ReturnData[0]!.SSN).toBe('555667777')
    expect(result.ReturnData[0]!.FirstName).toBe('Alice')
    expect(result.ReturnData[0]!.LastName).toBe('Johnson')
    expect(result.ReturnData[0]!.WagesTipsOtherComp).toBe(85000)
    expect(result.ReturnData[0]!.FederalIncomeTaxWithheld).toBe(14000)
  })

  it('maps state-level data when provided', () => {
    const result = buildFormW2Payload({
      taxYear: '2025',
      businessId: 'biz-5',
      employees: [
        {
          ssn: '111111111',
          firstName: 'Bob',
          lastName: 'Smith',
          address1: '1 St',
          city: 'LA',
          state: 'CA',
          zip: '90001',
          wages: 50000,
          federalTaxWithheld: 8000,
          socialSecurityWages: 50000,
          socialSecurityTax: 3100,
          medicareWages: 50000,
          medicareTax: 725,
          states: [
            {
              stateCode: 'CA',
              stateWages: 50000,
              stateTaxWithheld: 2500,
              employerStateId: 'CA-12345',
            },
          ],
        },
      ],
    })

    const states = result.ReturnData[0]!.States
    expect(states).toHaveLength(1)
    expect(states![0]!.StateCode).toBe('CA')
    expect(states![0]!.EmployerStateIdNumber).toBe('CA-12345')
  })

  it('strips non-digit characters from SSN', () => {
    const result = buildFormW2Payload({
      taxYear: '2025',
      businessId: 'biz-6',
      employees: [
        {
          ssn: '123-45-6789',
          firstName: 'Test',
          lastName: 'User',
          address1: '1 St',
          city: 'NYC',
          state: 'NY',
          zip: '10001',
          wages: 1000,
          federalTaxWithheld: 100,
          socialSecurityWages: 1000,
          socialSecurityTax: 62,
          medicareWages: 1000,
          medicareTax: 14.5,
        },
      ],
    })

    expect(result.ReturnData[0]!.SSN).toBe('123456789')
  })
})

// ─── Form 941 Payload Builder ──────────────────────────────────────────────

describe('buildForm941Payload', () => {
  it('builds a valid quarterly tax return payload', () => {
    const result = buildForm941Payload({
      taxYear: '2025',
      quarter: 'Q1',
      businessId: 'biz-7',
      numberOfEmployees: 10,
      wagesTipsComp: 250000,
      federalTaxWithheld: 50000,
      socialSecurityWages: 250000,
      medicareWages: 250000,
      totalTaxBeforeAdjustments: 88250,
      totalTaxAfterAdjustments: 88250,
      totalDeposits: 88250,
      balanceDue: 0,
    })

    expect(result.SubmissionManifest.Quarter).toBe('Q1')
    expect(result.ReturnData.NumberOfEmployees).toBe(10)
    expect(result.ReturnData.WagesTipsComp).toBe(250000)
    expect(result.ReturnData.BalanceDue).toBe(0)
  })

  it('includes monthly deposits when provided', () => {
    const result = buildForm941Payload({
      taxYear: '2025',
      quarter: 'Q2',
      businessId: 'biz-8',
      numberOfEmployees: 5,
      wagesTipsComp: 100000,
      federalTaxWithheld: 20000,
      socialSecurityWages: 100000,
      medicareWages: 100000,
      totalTaxBeforeAdjustments: 35000,
      totalTaxAfterAdjustments: 35000,
      totalDeposits: 35000,
      balanceDue: 0,
      monthlyDeposits: { month1: 12000, month2: 11500, month3: 11500 },
    })

    expect(result.ReturnData.MonthlyDeposits).toEqual({
      Month1: 12000,
      Month2: 11500,
      Month3: 11500,
    })
  })

  it('leaves MonthlyDeposits undefined when not provided', () => {
    const result = buildForm941Payload({
      taxYear: '2025',
      quarter: 'Q3',
      businessId: 'biz-9',
      numberOfEmployees: 2,
      wagesTipsComp: 40000,
      federalTaxWithheld: 8000,
      socialSecurityWages: 40000,
      medicareWages: 40000,
      totalTaxBeforeAdjustments: 14000,
      totalTaxAfterAdjustments: 14000,
      totalDeposits: 14000,
      balanceDue: 0,
    })

    expect(result.ReturnData.MonthlyDeposits).toBeUndefined()
  })
})

// ─── Form 940 Payload Builder ──────────────────────────────────────────────

describe('buildForm940Payload', () => {
  it('builds a valid FUTA tax return payload', () => {
    const result = buildForm940Payload({
      taxYear: '2025',
      businessId: 'biz-10',
      futaState: 'TX',
      totalPayments: 500000,
      totalTaxableWages: 70000,
      futaTax: 420,
      totalFutaTaxAfterAdjustments: 420,
      totalDeposits: 420,
      balanceDue: 0,
    })

    expect(result.SubmissionManifest.TaxYear).toBe('2025')
    expect(result.ReturnData.FUTAState).toBe('TX')
    expect(result.ReturnData.IsMultiState).toBe(false)
    expect(result.ReturnData.TotalPayments).toBe(500000)
    expect(result.ReturnData.FUTATax).toBe(420)
  })

  it('includes quarterly liabilities when provided', () => {
    const result = buildForm940Payload({
      taxYear: '2025',
      businessId: 'biz-11',
      futaState: 'CA',
      totalPayments: 200000,
      totalTaxableWages: 35000,
      futaTax: 210,
      totalFutaTaxAfterAdjustments: 210,
      totalDeposits: 210,
      balanceDue: 0,
      quarterlyLiabilities: { q1: 60, q2: 50, q3: 50, q4: 50 },
    })

    expect(result.ReturnData.QuarterlyLiabilities).toEqual({
      Q1: 60,
      Q2: 50,
      Q3: 50,
      Q4: 50,
    })
  })

  it('maps multi-state credits when provided', () => {
    const result = buildForm940Payload({
      taxYear: '2025',
      businessId: 'biz-12',
      futaState: 'CA',
      isMultiState: true,
      multiStateCredits: [
        { stateCode: 'CA', creditReductionRate: 0.003 },
        { stateCode: 'NY', creditReductionRate: 0.002 },
      ],
      totalPayments: 300000,
      totalTaxableWages: 50000,
      futaTax: 300,
      totalFutaTaxAfterAdjustments: 315,
      totalDeposits: 315,
      balanceDue: 0,
    })

    expect(result.ReturnData.IsMultiState).toBe(true)
    expect(result.ReturnData.MultiStateCredits).toHaveLength(2)
    expect(result.ReturnData.MultiStateCredits![0]!.StateCode).toBe('CA')
  })
})

// ─── Form 1095-C Payload Builder ───────────────────────────────────────────

describe('buildForm1095cPayload', () => {
  it('builds a valid ACA reporting payload', () => {
    const result = buildForm1095cPayload({
      taxYear: '2025',
      businessId: 'biz-13',
      employees: [
        {
          ssn: '444-55-6666',
          firstName: 'Carol',
          lastName: 'Williams',
          address1: '100 Health Dr',
          city: 'Portland',
          state: 'OR',
          zip: '97201',
          allYearOfferCode: '1A',
        },
      ],
    })

    expect(result.SubmissionManifest.TaxYear).toBe('2025')
    expect(result.ReturnData[0]!.SSN).toBe('444556666')
    expect(result.ReturnData[0]!.AllYearCoverageOfferCode).toBe('1A')
  })

  it('maps monthly info when provided', () => {
    const result = buildForm1095cPayload({
      taxYear: '2025',
      businessId: 'biz-14',
      employees: [
        {
          ssn: '777888999',
          firstName: 'Dan',
          lastName: 'Brown',
          address1: '1 St',
          city: 'LA',
          state: 'CA',
          zip: '90001',
          monthlyInfo: [
            { month: 'January', offerCode: '1A', premiumAmount: 150, safeHarborCode: '2C' },
          ],
        },
      ],
    })

    const monthly = result.ReturnData[0]!.MonthlyInfo
    expect(monthly).toHaveLength(1)
    expect(monthly![0]!.Month).toBe('January')
    expect(monthly![0]!.OfferOfCoverage).toBe('1A')
    expect(monthly![0]!.EmployeeShareLowestCostMonthlyPremium).toBe(150)
    expect(monthly![0]!.SafeHarborCode).toBe('2C')
  })

  it('maps covered individuals when provided', () => {
    const result = buildForm1095cPayload({
      taxYear: '2025',
      businessId: 'biz-15',
      employees: [
        {
          ssn: '111-22-3333',
          firstName: 'Eve',
          lastName: 'Green',
          address1: '1 St',
          city: 'SF',
          state: 'CA',
          zip: '94101',
          coveredIndividuals: [
            {
              ssn: '999-88-7777',
              firstName: 'Child',
              lastName: 'Green',
              isAllYearCovered: true,
            },
          ],
        },
      ],
    })

    const individuals = result.ReturnData[0]!.CoveredIndividuals
    expect(individuals).toHaveLength(1)
    expect(individuals![0]!.SSN).toBe('999887777')
    expect(individuals![0]!.IsAllYearCovered).toBe(true)
  })
})
