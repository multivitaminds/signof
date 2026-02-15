// ─── Generic Form Service ────────────────────────────────────────────────
//
// Factory that creates a typed service for ANY TaxBandits form endpoint.
// Each form (1099-NEC, W-2, 941, etc.) shares the same CRUD + lifecycle
// operations — this avoids duplicating fetch logic across 30+ form types.

import type { TaxBanditClient } from '../taxBanditClient'
import type { TaxBanditValidationError } from '../../types'

// ─── Response Types ──────────────────────────────────────────────────────

export interface FormServiceResponse<T> {
  StatusCode: number
  StatusName: string
  SubmissionId: string
  Records: T[]
}

export interface FormRecord {
  RecordId: string
  Status: string
  RecordStatus?: string
  SequenceId?: string
}

interface StatusRecord {
  RecordId: string
  Status: string
  AcknowledgementStatus: string
  IRSErrors: Array<{ ErrorCode: string; ErrorMessage: string }> | null
}

interface StatusResponse {
  StatusCode: number
  StatusName: string
  SubmissionId: string
  Records: StatusRecord[]
}

interface ListResponse {
  StatusCode: number
  StatusName: string
  Records: unknown[]
  TotalRecords: number
  Page: number
  PageSize: number
  TotalPages: number
}

interface PdfResponse {
  StatusCode: number
  StatusName: string
  PDFURL: string
}

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

// ─── Form Service Interface ─────────────────────────────────────────────

export interface FormServiceStatusResult {
  status: string
  acknowledgementStatus: string
  irsErrors: Array<{ code: string; message: string }>
}

export interface FormServiceListResult {
  records: unknown[]
  totalRecords: number
  page: number
  pageSize: number
  totalPages: number
}

export interface FormService<TPayload> {
  create(payload: TPayload): Promise<{ submissionId: string; recordId: string }>
  update(submissionId: string, payload: TPayload): Promise<void>
  validate(submissionId: string): Promise<TaxBanditValidationError[]>
  transmit(submissionId: string, recordIds: string[]): Promise<void>
  getStatus(submissionId: string): Promise<FormServiceStatusResult>
  get(submissionId: string): Promise<unknown>
  list(page?: number, pageSize?: number): Promise<FormServiceListResult>
  deleteFiling(submissionId: string): Promise<void>
  getPdf(submissionId: string): Promise<string>
}

// ─── Factory ─────────────────────────────────────────────────────────────

export function createFormService<TPayload>(
  client: TaxBanditClient,
  formPath: string
): FormService<TPayload> {
  return {
    async create(payload: TPayload) {
      const result = await client.fetch<FormServiceResponse<FormRecord>>(
        `${formPath}/Create`,
        { method: 'POST', body: payload }
      )
      return {
        submissionId: result.SubmissionId,
        recordId: result.Records?.[0]?.RecordId ?? '',
      }
    },

    async update(submissionId: string, payload: TPayload) {
      await client.fetch(`${formPath}/Update`, {
        method: 'PUT',
        body: { SubmissionId: submissionId, ...(payload as Record<string, unknown>) },
      })
    },

    async validate(submissionId: string) {
      const result = await client.fetch<ValidateResponse>(
        `${formPath}/Validate?SubmissionId=${encodeURIComponent(submissionId)}`
      )
      if (!result.Errors || result.Errors.length === 0) return []
      return result.Errors.map((e) => ({
        id: e.Id ?? crypto.randomUUID(),
        field: e.Field ?? '',
        message: e.Message ?? 'Unknown validation error',
        code: e.Code ?? '',
      }))
    },

    async transmit(submissionId: string, recordIds: string[]) {
      await client.fetch(`${formPath}/Transmit`, {
        method: 'POST',
        body: { SubmissionId: submissionId, RecordIds: recordIds },
      })
    },

    async getStatus(submissionId: string) {
      const result = await client.fetch<StatusResponse>(
        `${formPath}/Status?SubmissionId=${encodeURIComponent(submissionId)}`
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
    },

    async get(submissionId: string) {
      return client.fetch(
        `${formPath}/Get?SubmissionId=${encodeURIComponent(submissionId)}`
      )
    },

    async list(page = 1, pageSize = 10) {
      const result = await client.fetch<ListResponse>(
        `${formPath}/List?Page=${page}&PageSize=${pageSize}`
      )
      return {
        records: result.Records ?? [],
        totalRecords: result.TotalRecords,
        page: result.Page,
        pageSize: result.PageSize,
        totalPages: result.TotalPages,
      }
    },

    async deleteFiling(submissionId: string) {
      await client.fetch(`${formPath}/Delete`, {
        method: 'DELETE',
        body: { SubmissionId: submissionId },
      })
    },

    async getPdf(submissionId: string) {
      const result = await client.fetch<PdfResponse>(
        `${formPath}/RequestPDFURL?SubmissionId=${encodeURIComponent(submissionId)}`
      )
      return result.PDFURL
    },
  }
}
