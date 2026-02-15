import { createFormService } from './formService'
import type { TaxBanditClient } from '../taxBanditClient'

function createMockClient(): TaxBanditClient {
  return {
    fetch: vi.fn(),
  } as unknown as TaxBanditClient
}

describe('createFormService', () => {
  it('returns an object with all CRUD and lifecycle methods', () => {
    const client = createMockClient()
    const service = createFormService(client, 'Form1099NEC')

    expect(service).toHaveProperty('create')
    expect(service).toHaveProperty('update')
    expect(service).toHaveProperty('validate')
    expect(service).toHaveProperty('transmit')
    expect(service).toHaveProperty('getStatus')
    expect(service).toHaveProperty('get')
    expect(service).toHaveProperty('list')
    expect(service).toHaveProperty('deleteFiling')
    expect(service).toHaveProperty('getPdf')
  })

  it('create calls POST on {formPath}/Create and returns submissionId and recordId', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      StatusCode: 200,
      StatusName: 'Success',
      SubmissionId: 'sub-123',
      Records: [{ RecordId: 'rec-456', Status: 'Created' }],
    })

    const service = createFormService(client, 'Form1099NEC')
    const result = await service.create({ foo: 'bar' } as Record<string, unknown>)

    expect(fetchMock).toHaveBeenCalledWith('Form1099NEC/Create', {
      method: 'POST',
      body: { foo: 'bar' },
    })
    expect(result).toEqual({ submissionId: 'sub-123', recordId: 'rec-456' })
  })

  it('update calls PUT on {formPath}/Update with SubmissionId merged into payload', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({})

    const service = createFormService(client, 'FormW2')
    await service.update('sub-789', { data: 'value' } as unknown as Record<string, unknown>)

    expect(fetchMock).toHaveBeenCalledWith('FormW2/Update', {
      method: 'PUT',
      body: { SubmissionId: 'sub-789', data: 'value' },
    })
  })

  it('validate returns empty array when no errors', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      StatusCode: 200,
      StatusName: 'Success',
      Errors: null,
    })

    const service = createFormService(client, 'Form941')
    const errors = await service.validate('sub-100')

    expect(fetchMock).toHaveBeenCalledWith('Form941/Validate?SubmissionId=sub-100')
    expect(errors).toEqual([])
  })

  it('validate returns mapped errors when present', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      StatusCode: 200,
      StatusName: 'Success',
      Errors: [
        { Id: 'e1', Field: 'SSN', Message: 'Invalid SSN', Code: 'SSN_INVALID' },
      ],
    })

    const service = createFormService(client, 'Form941')
    const errors = await service.validate('sub-200')

    expect(errors).toHaveLength(1)
    expect(errors[0]).toEqual({
      id: 'e1',
      field: 'SSN',
      message: 'Invalid SSN',
      code: 'SSN_INVALID',
    })
  })

  it('transmit calls POST on {formPath}/Transmit with submissionId and recordIds', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({})

    const service = createFormService(client, 'Form940')
    await service.transmit('sub-300', ['rec-1', 'rec-2'])

    expect(fetchMock).toHaveBeenCalledWith('Form940/Transmit', {
      method: 'POST',
      body: { SubmissionId: 'sub-300', RecordIds: ['rec-1', 'rec-2'] },
    })
  })

  it('getStatus returns mapped status with IRS errors', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      StatusCode: 200,
      StatusName: 'Success',
      SubmissionId: 'sub-400',
      Records: [
        {
          RecordId: 'rec-1',
          Status: 'Filed',
          AcknowledgementStatus: 'Accepted',
          IRSErrors: [{ ErrorCode: 'IRS-001', ErrorMessage: 'Name mismatch' }],
        },
      ],
    })

    const service = createFormService(client, 'Form1095C')
    const status = await service.getStatus('sub-400')

    expect(fetchMock).toHaveBeenCalledWith('Form1095C/Status?SubmissionId=sub-400')
    expect(status.status).toBe('Filed')
    expect(status.acknowledgementStatus).toBe('Accepted')
    expect(status.irsErrors).toEqual([{ code: 'IRS-001', message: 'Name mismatch' }])
  })

  it('list calls GET on {formPath}/List with pagination params', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      StatusCode: 200,
      StatusName: 'Success',
      Records: [{ id: 1 }, { id: 2 }],
      TotalRecords: 50,
      Page: 2,
      PageSize: 10,
      TotalPages: 5,
    })

    const service = createFormService(client, 'Form1099MISC')
    const result = await service.list(2, 10)

    expect(fetchMock).toHaveBeenCalledWith('Form1099MISC/List?Page=2&PageSize=10')
    expect(result.records).toHaveLength(2)
    expect(result.totalRecords).toBe(50)
    expect(result.page).toBe(2)
    expect(result.totalPages).toBe(5)
  })

  it('deleteFiling calls DELETE on {formPath}/Delete', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({})

    const service = createFormService(client, 'FormW2')
    await service.deleteFiling('sub-500')

    expect(fetchMock).toHaveBeenCalledWith('FormW2/Delete', {
      method: 'DELETE',
      body: { SubmissionId: 'sub-500' },
    })
  })

  it('getPdf calls GET on {formPath}/RequestPDFURL and returns the URL', async () => {
    const client = createMockClient()
    const fetchMock = client.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      StatusCode: 200,
      StatusName: 'Success',
      PDFURL: 'https://example.com/return.pdf',
    })

    const service = createFormService(client, 'Form1099NEC')
    const url = await service.getPdf('sub-600')

    expect(fetchMock).toHaveBeenCalledWith('Form1099NEC/RequestPDFURL?SubmissionId=sub-600')
    expect(url).toBe('https://example.com/return.pdf')
  })
})
