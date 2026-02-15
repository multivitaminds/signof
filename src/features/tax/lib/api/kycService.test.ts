import { createKycService } from './kycService'
import type { TaxBanditClient } from '../taxBanditClient'

function createMockClient(): TaxBanditClient {
  return {
    fetch: vi.fn(),
  } as unknown as TaxBanditClient
}

describe('KYC Service', () => {
  describe('verifyTin', () => {
    it('calls TINMatching/Verify with cleaned TIN and name', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        TINMatchingResult: {
          IsValid: true,
          TINType: 'SSN',
          StatusCode: '0',
          StatusMessage: 'TIN and Name match',
        },
      })

      const service = createKycService(client)
      const result = await service.verifyTin('123-45-6789', 'Jane Doe')

      expect(fetchMock).toHaveBeenCalledWith('TINMatching/Verify', {
        method: 'POST',
        body: { TIN: '123456789', Name: 'Jane Doe' },
      })
      expect(result.isValid).toBe(true)
      expect(result.tinType).toBe('SSN')
      expect(result.statusCode).toBe('0')
      expect(result.statusMessage).toBe('TIN and Name match')
    })

    it('returns invalid result for mismatched TIN', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        TINMatchingResult: {
          IsValid: false,
          TINType: 'EIN',
          StatusCode: '1',
          StatusMessage: 'TIN and Name do not match',
        },
      })

      const service = createKycService(client)
      const result = await service.verifyTin('987654321', 'Wrong Name')

      expect(result.isValid).toBe(false)
      expect(result.tinType).toBe('EIN')
      expect(result.statusMessage).toBe('TIN and Name do not match')
    })

    it('strips non-digit characters from TIN input', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        TINMatchingResult: {
          IsValid: true,
          TINType: 'SSN',
          StatusCode: '0',
          StatusMessage: 'Match',
        },
      })

      const service = createKycService(client)
      await service.verifyTin('12-3456789', 'Test')

      expect(fetchMock).toHaveBeenCalledWith('TINMatching/Verify', {
        method: 'POST',
        body: { TIN: '123456789', Name: 'Test' },
      })
    })
  })

  describe('validateAddress', () => {
    it('calls Address/Validate and returns corrected address', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        AddressResult: {
          IsValid: true,
          CorrectedAddress: {
            Address1: '123 MAIN ST',
            Address2: 'APT 4B',
            City: 'AUSTIN',
            State: 'TX',
            ZipCode: '78701',
            ZipPlus4: '1234',
          },
          Footnotes: ['A#', 'N#'],
          DPVConfirmation: 'Y',
        },
      })

      const service = createKycService(client)
      const result = await service.validateAddress({
        address1: '123 Main St',
        address2: 'Apt 4B',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      })

      expect(fetchMock).toHaveBeenCalledWith('Address/Validate', {
        method: 'POST',
        body: {
          Address1: '123 Main St',
          Address2: 'Apt 4B',
          City: 'Austin',
          State: 'TX',
          ZipCode: '78701',
        },
      })
      expect(result.isValid).toBe(true)
      expect(result.correctedAddress.address1).toBe('123 MAIN ST')
      expect(result.correctedAddress.zipPlus4).toBe('1234')
      expect(result.footnotes).toEqual(['A#', 'N#'])
      expect(result.dpvConfirmation).toBe('Y')
    })

    it('returns invalid result for bad address', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        AddressResult: {
          IsValid: false,
          CorrectedAddress: {
            Address1: '',
            Address2: '',
            City: '',
            State: '',
            ZipCode: '',
            ZipPlus4: '',
          },
          Footnotes: null,
          DPVConfirmation: 'N',
        },
      })

      const service = createKycService(client)
      const result = await service.validateAddress({
        address1: 'INVALID',
        city: 'NOWHERE',
        state: 'XX',
        zip: '00000',
      })

      expect(result.isValid).toBe(false)
      expect(result.footnotes).toEqual([])
      expect(result.dpvConfirmation).toBe('N')
    })

    it('defaults address2 to empty string when not provided', async () => {
      const client = createMockClient()
      const fetchMock = client.fetch as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValue({
        StatusCode: 200,
        StatusName: 'Success',
        AddressResult: {
          IsValid: true,
          CorrectedAddress: {
            Address1: '456 ELM ST',
            Address2: '',
            City: 'DALLAS',
            State: 'TX',
            ZipCode: '75201',
            ZipPlus4: '',
          },
          Footnotes: [],
          DPVConfirmation: 'Y',
        },
      })

      const service = createKycService(client)
      await service.validateAddress({
        address1: '456 Elm St',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
      })

      expect(fetchMock).toHaveBeenCalledWith('Address/Validate', {
        method: 'POST',
        body: {
          Address1: '456 Elm St',
          Address2: '',
          City: 'Dallas',
          State: 'TX',
          ZipCode: '75201',
        },
      })
    })
  })
})
