// ─── TaxBandit API Service Layer ─────────────────────────────────────────
//
// Client-side integration with TaxBandit's REST API for IRS e-filing.
// Supports sandbox (testing) and production modes.
// Credentials are never hardcoded — they come from the user via the store.
//
// API docs: https://developer.taxbandits.com/

import type { TaxFiling } from '../types'
import type { TaxBanditConfig, TaxBanditValidationError } from '../types'

// ─── Endpoints ──────────────────────────────────────────────────────────

const TAXBANDIT_SANDBOX_URL = 'https://testapi.taxbandits.com/v1.7.3'
const TAXBANDIT_PROD_URL = 'https://api.taxbandits.com/v1.7.3'

function getBaseUrl(useSandbox: boolean): string {
  return useSandbox ? TAXBANDIT_SANDBOX_URL : TAXBANDIT_PROD_URL
}

// ─── Error Class ────────────────────────────────────────────────────────

export class TaxBanditError extends Error {
  statusCode: number
  statusName: string
  errors: Array<{ id: string; name: string; message: string }>

  constructor(
    statusCode: number,
    statusName: string,
    errors: Array<{ id: string; name: string; message: string }> = []
  ) {
    super(`TaxBandit API error: ${statusName} (${statusCode})`)
    this.name = 'TaxBanditError'
    this.statusCode = statusCode
    this.statusName = statusName
    this.errors = errors
  }
}

// ─── Internal Fetch Helper ──────────────────────────────────────────────

async function apiFetch<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, options)
  } catch (err) {
    throw new TaxBanditError(0, 'NetworkError', [
      {
        id: 'NETWORK',
        name: 'NetworkError',
        message: err instanceof Error ? err.message : 'Network request failed',
      },
    ])
  }

  if (!response.ok) {
    let body: Record<string, unknown> = {}
    try {
      body = (await response.json()) as Record<string, unknown>
    } catch {
      // response is not JSON
    }

    if (response.status === 401) {
      throw new TaxBanditError(401, 'Unauthorized', [
        {
          id: 'AUTH',
          name: 'Unauthorized',
          message: 'Invalid or expired credentials. Please re-authenticate.',
        },
      ])
    }

    const errors = Array.isArray(body.Errors)
      ? (body.Errors as Array<{ Id?: string; Name?: string; Message?: string }>).map((e) => ({
          id: e.Id ?? '',
          name: e.Name ?? '',
          message: e.Message ?? '',
        }))
      : []

    throw new TaxBanditError(
      response.status,
      (body.StatusName as string) ?? response.statusText,
      errors
    )
  }

  return (await response.json()) as T
}

// ─── Auth ───────────────────────────────────────────────────────────────

interface JWTResponse {
  AccessToken: string
  TokenType: string
  ExpiresIn: number
  StatusCode: number
  StatusName: string
}

export async function getAccessToken(
  config: TaxBanditConfig
): Promise<{ token: string; expiresIn: number }> {
  const baseUrl = getBaseUrl(config.useSandbox)
  const result = await apiFetch<JWTResponse>(`${baseUrl}/Auth/GetJWT`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authentication: config.userToken,
    },
    body: JSON.stringify({
      ClientId: config.clientId,
      ClientSecret: config.clientSecret,
      UserToken: config.userToken,
    }),
  })

  return {
    token: result.AccessToken,
    expiresIn: result.ExpiresIn,
  }
}

// ─── Business ───────────────────────────────────────────────────────────

interface CreateBusinessResponse {
  BusinessId: string
  StatusCode: number
  StatusName: string
}

export async function createBusiness(
  config: TaxBanditConfig,
  token: string,
  filing: TaxFiling
): Promise<string> {
  const baseUrl = getBaseUrl(config.useSandbox)
  const result = await apiFetch<CreateBusinessResponse>(
    `${baseUrl}/Business/Create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        BusinessName: `${filing.firstName} ${filing.lastName}`,
        PayerRef: filing.id,
        TaxIdType: 'SSN',
        TINorSSN: filing.ssn.replace(/[^\d]/g, ''),
        IsEIN: false,
        ContactName: `${filing.firstName} ${filing.lastName}`,
        Phone: filing.phone.replace(/[^\d]/g, ''),
        Email: filing.email,
        Address1: filing.address.street,
        Address2: filing.address.apt,
        City: filing.address.city,
        State: filing.address.state,
        ZipCode: filing.address.zip,
        Country: 'US',
      }),
    }
  )

  return result.BusinessId
}

// ─── Create 1040 Return ─────────────────────────────────────────────────

interface Create1040Response {
  SubmissionId: string
  Records: Array<{ RecordId: string; Status: string }>
  StatusCode: number
  StatusName: string
}

export async function create1040Return(
  config: TaxBanditConfig,
  token: string,
  businessId: string,
  filing: TaxFiling
): Promise<{ submissionId: string; recordId: string }> {
  const baseUrl = getBaseUrl(config.useSandbox)
  const payload = mapFilingToTaxBanditPayload(filing, businessId)

  const result = await apiFetch<Create1040Response>(
    `${baseUrl}/Form1040/Create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )

  const recordId = result.Records?.[0]?.RecordId ?? ''
  return {
    submissionId: result.SubmissionId,
    recordId,
  }
}

// ─── Validate ───────────────────────────────────────────────────────────

interface ValidateResponse {
  StatusCode: number
  StatusName: string
  Errors: Array<{
    Id?: string
    Field?: string
    Message?: string
    Code?: string
  }> | null
}

export async function validateReturn(
  config: TaxBanditConfig,
  token: string,
  submissionId: string
): Promise<TaxBanditValidationError[]> {
  const baseUrl = getBaseUrl(config.useSandbox)
  const result = await apiFetch<ValidateResponse>(
    `${baseUrl}/Form1040/Validate?SubmissionId=${encodeURIComponent(submissionId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!result.Errors || result.Errors.length === 0) {
    return []
  }

  return result.Errors.map((e) => ({
    id: e.Id ?? crypto.randomUUID(),
    field: e.Field ?? '',
    message: e.Message ?? 'Unknown validation error',
    code: e.Code ?? '',
  }))
}

// ─── Transmit ───────────────────────────────────────────────────────────

interface TransmitResponse {
  StatusCode: number
  StatusName: string
  SubmissionId: string
}

export async function transmitReturn(
  config: TaxBanditConfig,
  token: string,
  submissionId: string,
  recordIds: string[]
): Promise<void> {
  const baseUrl = getBaseUrl(config.useSandbox)
  await apiFetch<TransmitResponse>(`${baseUrl}/Form1040/Transmit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      SubmissionId: submissionId,
      RecordIds: recordIds,
    }),
  })
}

// ─── Filing Status ──────────────────────────────────────────────────────

interface StatusResponse {
  StatusCode: number
  StatusName: string
  SubmissionId: string
  Records: Array<{
    RecordId: string
    Status: string
    AcknowledgementStatus: string
    IRSErrors: Array<{ ErrorCode: string; ErrorMessage: string }> | null
  }>
}

export interface FilingStatusResult {
  status: string
  acknowledgementStatus: string
  irsErrors: Array<{ code: string; message: string }>
}

export async function getFilingStatus(
  config: TaxBanditConfig,
  token: string,
  submissionId: string
): Promise<FilingStatusResult> {
  const baseUrl = getBaseUrl(config.useSandbox)
  const result = await apiFetch<StatusResponse>(
    `${baseUrl}/Form1040/Status?SubmissionId=${encodeURIComponent(submissionId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const record = result.Records?.[0]
  return {
    status: record?.Status ?? 'Unknown',
    acknowledgementStatus: record?.AcknowledgementStatus ?? 'Pending',
    irsErrors:
      record?.IRSErrors?.map((e) => ({
        code: e.ErrorCode,
        message: e.ErrorMessage,
      })) ?? [],
  }
}

// ─── PDF Download ───────────────────────────────────────────────────────

interface PdfResponse {
  StatusCode: number
  StatusName: string
  PDFURL: string
}

export async function getReturnPdf(
  config: TaxBanditConfig,
  token: string,
  submissionId: string
): Promise<string> {
  const baseUrl = getBaseUrl(config.useSandbox)
  const result = await apiFetch<PdfResponse>(
    `${baseUrl}/Form1040/RequestPDFURL?SubmissionId=${encodeURIComponent(submissionId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return result.PDFURL
}

// ─── Payload Mapping ────────────────────────────────────────────────────

function mapFilingToTaxBanditPayload(
  filing: TaxFiling,
  businessId: string
): Record<string, unknown> {
  return {
    BusinessId: businessId,
    TaxYear: filing.taxYear,
    ReturnHeader: {
      FilingStatus: mapFilingStatusToTaxBandit(filing.filingStatus),
      TaxpayerName: {
        FirstName: filing.firstName,
        LastName: filing.lastName,
      },
      SSN: filing.ssn.replace(/[^\d]/g, ''),
      Address: {
        Address1: filing.address.street,
        Address2: filing.address.apt,
        City: filing.address.city,
        State: filing.address.state,
        ZipCode: filing.address.zip,
      },
      Phone: filing.phone.replace(/[^\d]/g, ''),
      Email: filing.email,
    },
    ReturnData: {
      Wages: filing.wages,
      OtherIncome: filing.otherIncome,
      TotalIncome: filing.totalIncome,
      StandardDeduction: filing.useStandardDeduction ? filing.standardDeduction : 0,
      ItemizedDeductions: filing.useStandardDeduction ? 0 : filing.itemizedDeductions,
      TaxableIncome: filing.taxableIncome,
      FederalTax: filing.federalTax,
      TaxWithheld: filing.withheld,
      EstimatedTaxPayments: filing.estimatedPayments,
      RefundOrOwed: filing.refundOrOwed,
    },
  }
}

function mapFilingStatusToTaxBandit(
  status: TaxFiling['filingStatus']
): string {
  const statusMap: Record<string, string> = {
    single: '1',
    married_joint: '2',
    married_separate: '3',
    head_of_household: '4',
    qualifying_widow: '5',
  }
  return statusMap[status] ?? '1'
}

export function mapTaxBanditStatusToFilingState(
  ackStatus: string
): 'filed' | 'accepted' | 'rejected' {
  const normalized = ackStatus.toLowerCase()
  if (normalized === 'accepted') return 'accepted'
  if (normalized === 'rejected') return 'rejected'
  return 'filed'
}
