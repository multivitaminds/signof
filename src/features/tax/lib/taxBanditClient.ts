// ─── TaxBandit API Client ────────────────────────────────────────────────
//
// Manages OAuth authentication and provides a generic fetch method
// for all TaxBandits API endpoints. Handles token refresh, error
// parsing, and sandbox/production environment switching.
//
// API docs: https://developer.taxbandits.com/

import type { TaxBanditConfig } from '../types'

// ─── OAuth URLs ──────────────────────────────────────────────────────────

const SANDBOX_OAUTH_URL = 'https://testoauth.expressauth.net/v2/tbsauth'
const PROD_OAUTH_URL = 'https://oauth.expressauth.net/v2/tbsauth'

// ─── API URLs ────────────────────────────────────────────────────────────

const SANDBOX_API_URL = 'https://testapi.taxbandits.com/v1.7.3'
const PROD_API_URL = 'https://api.taxbandits.com/v1.7.3'

/** Buffer before actual expiry to trigger re-auth (5 minutes in ms) */
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000

// ─── Error Class ─────────────────────────────────────────────────────────

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

// ─── JWT Response ────────────────────────────────────────────────────────

interface JWTResponse {
  AccessToken: string
  TokenType: string
  ExpiresIn: number
  StatusCode: number
  StatusName: string
}

// ─── Client ──────────────────────────────────────────────────────────────

export class TaxBanditClient {
  private config: TaxBanditConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private useSandbox: boolean

  constructor(config: TaxBanditConfig) {
    this.config = config
    this.useSandbox = config.useSandbox
  }

  /** Base API URL for the current environment */
  private get apiUrl(): string {
    return this.useSandbox ? SANDBOX_API_URL : PROD_API_URL
  }

  /** OAuth URL for the current environment */
  private get oauthUrl(): string {
    return this.useSandbox ? SANDBOX_OAUTH_URL : PROD_OAUTH_URL
  }

  /** Switch between sandbox and production */
  setEnvironment(useSandbox: boolean): void {
    if (this.useSandbox !== useSandbox) {
      this.useSandbox = useSandbox
      // Invalidate token when switching environments
      this.accessToken = null
      this.tokenExpiry = 0
    }
  }

  /**
   * Authenticate with TaxBandits OAuth and obtain a JWT token.
   * The token is cached and automatically refreshed before expiry.
   */
  async authenticate(): Promise<string> {
    let response: Response
    try {
      response = await fetch(this.oauthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: this.config.userToken,
        },
        body: JSON.stringify({
          ClientId: this.config.clientId,
          ClientSecret: this.config.clientSecret,
          UserToken: this.config.userToken,
        }),
      })
    } catch (err) {
      throw new TaxBanditError(0, 'NetworkError', [
        {
          id: 'NETWORK',
          name: 'NetworkError',
          message: err instanceof Error ? err.message : 'OAuth request failed',
        },
      ])
    }

    if (!response.ok) {
      throw new TaxBanditError(response.status, 'AuthenticationFailed', [
        {
          id: 'AUTH',
          name: 'AuthenticationFailed',
          message: `OAuth returned ${response.status}: ${response.statusText}`,
        },
      ])
    }

    const result = (await response.json()) as JWTResponse

    if (result.StatusCode !== 200) {
      throw new TaxBanditError(result.StatusCode, result.StatusName, [
        {
          id: 'AUTH',
          name: result.StatusName,
          message: `OAuth status: ${result.StatusName}`,
        },
      ])
    }

    this.accessToken = result.AccessToken
    // Refresh 5 minutes before actual expiry
    this.tokenExpiry = Date.now() + result.ExpiresIn * 1000 - TOKEN_REFRESH_BUFFER_MS

    return result.AccessToken
  }

  /** Get a valid token, refreshing if needed */
  private async getToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate()
    }
    return this.accessToken!
  }

  /**
   * Make an authenticated API request.
   * Automatically handles token refresh, JSON serialization, and error parsing.
   */
  async fetch<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T> {
    const token = await this.getToken()
    const url = `${this.apiUrl}/${path}`

    let response: Response
    try {
      response = await fetch(url, {
        method: options?.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
      })
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
        // Invalidate cached token and throw
        this.accessToken = null
        this.tokenExpiry = 0
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

  /** Check if the client has credentials configured */
  hasCredentials(): boolean {
    return Boolean(this.config.clientId && this.config.clientSecret && this.config.userToken)
  }

  /** Check if the client has a valid (non-expired) token */
  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiry
  }
}
