import { createBusinessService } from './businessService'
import type { TaxBanditClient } from '../taxBanditClient'
import type { BusinessData } from './businessService'

function createMockClient(): TaxBanditClient {
  return {
    fetch: vi.fn(),
  } as unknown as TaxBanditClient
}

const sampleBusinessData: BusinessData = {
  businessName: 'Acme Corp',
  taxIdType: 'EIN',
  tin: '12-3456789',
  isEIN: true,
  contactName: 'John Doe',
  phone: '(555) 123-4567',
  email: 'john@acme.com',
  address1: '100 Business Blvd',
  address2: 'Suite 200',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
}

describe('Business Service', () => {
  describe('create', () => {
    it('calls Business/Create with mapped payload and returns BusinessId', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        BusinessId: 'biz-001',
      })

      const service = createBusinessService(client)
      const result = await service.create(sampleBusinessData)

      expect(fetchMock).toHaveBeenCalledWith('Business/Create', {
        method: 'POST',
        body: {
          BusinessName: 'Acme Corp',
          PayerRef: '',
          TaxIdType: 'EIN',
          TINorSSN: '123456789',
          IsEIN: true,
          ContactName: 'John Doe',
          Phone: '5551234567',
          Email: 'john@acme.com',
          Address1: '100 Business Blvd',
          Address2: 'Suite 200',
          City: 'Austin',
          State: 'TX',
          ZipCode: '78701',
          Country: 'US',
        },
      })
      expect(result).toBe('biz-001')
    })

    it('strips non-digit characters from TIN and phone', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({ BusinessId: 'biz-002' })

      const service = createBusinessService(client)
      await service.create({
        ...sampleBusinessData,
        tin: '98-7654321',
        phone: '(800) 555-1234',
      })

      const calledBody = fetchMock.mock.calls[0]![1].body as Record<string, unknown>
      expect(calledBody.TINorSSN).toBe('987654321')
      expect(calledBody.Phone).toBe('8005551234')
    })
  })

  describe('get', () => {
    it('calls Business/Get with BusinessId and maps response to BusinessRecord', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        BusinessId: 'biz-001',
        BusinessName: 'Acme Corp',
        PayerRef: 'PR-001',
        TaxIdType: 'EIN',
        TINorSSN: '123456789',
        IsEIN: true,
        ContactName: 'John Doe',
        Phone: '5551234567',
        Email: 'john@acme.com',
        Address1: '100 Business Blvd',
        Address2: 'Suite 200',
        City: 'Austin',
        State: 'TX',
        ZipCode: '78701',
        Country: 'US',
      })

      const service = createBusinessService(client)
      const record = await service.get('biz-001')

      expect(fetchMock).toHaveBeenCalledWith('Business/Get?BusinessId=biz-001')
      expect(record.businessId).toBe('biz-001')
      expect(record.businessName).toBe('Acme Corp')
      expect(record.tin).toBe('123456789')
      expect(record.isEIN).toBe(true)
      expect(record.city).toBe('Austin')
      expect(record.country).toBe('US')
    })
  })

  describe('update', () => {
    it('calls Business/Update with BusinessId merged into mapped payload', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({})

      const service = createBusinessService(client)
      await service.update('biz-003', sampleBusinessData)

      expect(fetchMock).toHaveBeenCalledWith('Business/Update', {
        method: 'PUT',
        body: expect.objectContaining({
          BusinessId: 'biz-003',
          BusinessName: 'Acme Corp',
          TINorSSN: '123456789',
        }),
      })
    })
  })

  describe('list', () => {
    it('calls Business/List and maps all businesses', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        TotalRecords: 2,
        Businesses: [
          {
            BusinessId: 'biz-A',
            BusinessName: 'Alpha Inc',
            PayerRef: '',
            TaxIdType: 'EIN',
            TINorSSN: '111111111',
            IsEIN: true,
            ContactName: 'Alice',
            Phone: '1112223333',
            Email: 'alice@alpha.com',
            Address1: '1 A St',
            Address2: '',
            City: 'NYC',
            State: 'NY',
            ZipCode: '10001',
            Country: 'US',
          },
          {
            BusinessId: 'biz-B',
            BusinessName: 'Beta LLC',
            PayerRef: 'PR-B',
            TaxIdType: 'SSN',
            TINorSSN: '222222222',
            IsEIN: false,
            ContactName: 'Bob',
            Phone: '4445556666',
            Email: 'bob@beta.com',
            Address1: '2 B St',
            Address2: '',
            City: 'LA',
            State: 'CA',
            ZipCode: '90001',
            Country: 'US',
          },
        ],
      })

      const service = createBusinessService(client)
      const result = await service.list()

      expect(fetchMock).toHaveBeenCalledWith('Business/List')
      expect(result.totalRecords).toBe(2)
      expect(result.businesses).toHaveLength(2)
      expect(result.businesses[0]!.businessName).toBe('Alpha Inc')
      expect(result.businesses[1]!.businessName).toBe('Beta LLC')
    })

    it('returns empty businesses array when Businesses is null', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        TotalRecords: 0,
        Businesses: null,
      })

      const service = createBusinessService(client)
      const result = await service.list()

      expect(result.businesses).toEqual([])
      expect(result.totalRecords).toBe(0)
    })
  })
})
