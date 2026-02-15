import { TaxBanditClient, TaxBanditError } from './taxBanditClient'
import type { TaxBanditConfig } from '../types'

const TEST_CONFIG: TaxBanditConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  userToken: 'test-user-token',
  useSandbox: true,
}

function createSuccessfulAuthResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      AccessToken: 'jwt-token-123',
      TokenType: 'Bearer',
      ExpiresIn: 3600,
      StatusCode: 200,
      StatusName: 'Success',
    }),
  } as Response
}

describe('TaxBanditClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor and hasCredentials', () => {
    it('returns true when all credentials are provided', () => {
      const client = new TaxBanditClient(TEST_CONFIG)
      expect(client.hasCredentials()).toBe(true)
    })

    it('returns false when clientId is empty', () => {
      const client = new TaxBanditClient({ ...TEST_CONFIG, clientId: '' })
      expect(client.hasCredentials()).toBe(false)
    })

    it('returns false when clientSecret is empty', () => {
      const client = new TaxBanditClient({ ...TEST_CONFIG, clientSecret: '' })
      expect(client.hasCredentials()).toBe(false)
    })
  })

  describe('authenticate', () => {
    it('sends OAuth request and returns access token', async () => {
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createSuccessfulAuthResponse())

      const client = new TaxBanditClient(TEST_CONFIG)
      const token = await client.authenticate()

      expect(token).toBe('jwt-token-123')
      expect(fetchMock).toHaveBeenCalledWith(
        'https://testoauth.expressauth.net/v2/tbsauth',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authentication: 'test-user-token',
          }),
        })
      )
    })

    it('throws TaxBanditError on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response)

      const client = new TaxBanditClient(TEST_CONFIG)
      await expect(client.authenticate()).rejects.toThrow(TaxBanditError)
      await expect(client.authenticate()).rejects.toThrow('AuthenticationFailed')
    })

    it('throws TaxBanditError when StatusCode is not 200', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          AccessToken: '',
          TokenType: '',
          ExpiresIn: 0,
          StatusCode: 400,
          StatusName: 'InvalidCredentials',
        }),
      } as Response)

      const client = new TaxBanditClient(TEST_CONFIG)
      await expect(client.authenticate()).rejects.toThrow('InvalidCredentials')
    })

    it('throws TaxBanditError on network failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'))

      const client = new TaxBanditClient(TEST_CONFIG)
      await expect(client.authenticate()).rejects.toThrow(TaxBanditError)

      try {
        await client.authenticate()
      } catch (err) {
        const error = err as TaxBanditError
        expect(error.statusCode).toBe(0)
        expect(error.statusName).toBe('NetworkError')
        expect(error.errors[0]!.message).toBe('Network down')
      }
    })
  })

  describe('fetch', () => {
    it('authenticates and makes an API request with bearer token', async () => {
      const fetchMock = vi.spyOn(globalThis, 'fetch')
        // First call: OAuth
        .mockResolvedValueOnce(createSuccessfulAuthResponse())
        // Second call: API request
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'test-result' }),
        } as Response)

      const client = new TaxBanditClient(TEST_CONFIG)
      const result = await client.fetch<{ data: string }>('FormW2/Create')

      expect(result.data).toBe('test-result')
      expect(fetchMock).toHaveBeenCalledTimes(2)

      // Verify API request used Bearer token
      const apiCall = fetchMock.mock.calls[1]!
      expect(apiCall[0]).toBe('https://testapi.taxbandits.com/v1.7.3/FormW2/Create')
      expect(apiCall[1]).toMatchObject({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-123',
        }),
      })
    })

    it('sends POST body when provided', async () => {
      const fetchMock = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(createSuccessfulAuthResponse())
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response)

      const client = new TaxBanditClient(TEST_CONFIG)
      await client.fetch('FormW2/Create', {
        method: 'POST',
        body: { EmployerName: 'Test Corp' },
      })

      const apiCall = fetchMock.mock.calls[1]!
      expect(apiCall[1]).toMatchObject({
        method: 'POST',
        body: JSON.stringify({ EmployerName: 'Test Corp' }),
      })
    })

    it('throws TaxBanditError and invalidates token on 401 response', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(createSuccessfulAuthResponse())
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({}),
        } as Response)

      const client = new TaxBanditClient(TEST_CONFIG)

      await expect(client.fetch('FormW2/Status')).rejects.toThrow(TaxBanditError)
      expect(client.isAuthenticated()).toBe(false)
    })

    it('parses errors from API error response body', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(createSuccessfulAuthResponse())
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({
            StatusName: 'ValidationError',
            Errors: [
              { Id: 'E001', Name: 'InvalidSSN', Message: 'SSN format is invalid' },
            ],
          }),
        } as Response)

      const client = new TaxBanditClient(TEST_CONFIG)
      try {
        await client.fetch('FormW2/Create')
      } catch (err) {
        const error = err as TaxBanditError
        expect(error.statusCode).toBe(400)
        expect(error.statusName).toBe('ValidationError')
        expect(error.errors).toHaveLength(1)
        expect(error.errors[0]!.id).toBe('E001')
      }
    })

    it('throws on network error during API request', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(createSuccessfulAuthResponse())
        .mockRejectedValueOnce(new Error('Connection refused'))

      const client = new TaxBanditClient(TEST_CONFIG)
      await expect(client.fetch('FormW2/Status')).rejects.toThrow(TaxBanditError)
    })
  })

  describe('setEnvironment', () => {
    it('invalidates token when switching environments', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createSuccessfulAuthResponse())

      const client = new TaxBanditClient(TEST_CONFIG)
      await client.authenticate()
      expect(client.isAuthenticated()).toBe(true)

      client.setEnvironment(false) // switch to production
      expect(client.isAuthenticated()).toBe(false)
    })

    it('does not invalidate token when setting same environment', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createSuccessfulAuthResponse())

      const client = new TaxBanditClient(TEST_CONFIG)
      await client.authenticate()
      expect(client.isAuthenticated()).toBe(true)

      client.setEnvironment(true) // same as initial (sandbox)
      expect(client.isAuthenticated()).toBe(true)
    })
  })

  describe('isAuthenticated', () => {
    it('returns false before authentication', () => {
      const client = new TaxBanditClient(TEST_CONFIG)
      expect(client.isAuthenticated()).toBe(false)
    })

    it('returns true after successful authentication', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createSuccessfulAuthResponse())

      const client = new TaxBanditClient(TEST_CONFIG)
      await client.authenticate()
      expect(client.isAuthenticated()).toBe(true)
    })
  })
})
