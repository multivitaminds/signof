import {
  useSandboxStore,
  CodeExampleLang,
  generateCodeExample,
} from './useSandboxStore'
import type { SandboxRequest, SandboxResponse } from '../types'
import { HttpMethod } from '../types'

function resetStore() {
  useSandboxStore.setState({
    history: [],
    activeCodeLang: CodeExampleLang.Curl,
  })
}

function createRequest(overrides?: Partial<SandboxRequest>): SandboxRequest {
  return {
    method: HttpMethod.Get,
    url: '/v1/documents',
    headers: '{"Authorization": "Bearer sk_test_123"}',
    body: '',
    ...overrides,
  }
}

function createResponse(overrides?: Partial<SandboxResponse>): SandboxResponse {
  return {
    statusCode: 200,
    body: '{"data": []}',
    responseTime: 142,
    ...overrides,
  }
}

describe('useSandboxStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('History Management', () => {
    it('adds a history entry', () => {
      const req = createRequest()
      const res = createResponse()
      useSandboxStore.getState().addHistoryEntry(req, res)

      const { history } = useSandboxStore.getState()
      expect(history).toHaveLength(1)
      expect(history[0]!.request).toEqual(req)
      expect(history[0]!.response).toEqual(res)
      expect(history[0]!.timestamp).toBeTruthy()
      expect(history[0]!.id).toBeTruthy()
    })

    it('adds new entries at the beginning of history', () => {
      useSandboxStore.getState().addHistoryEntry(
        createRequest({ url: '/v1/first' }),
        createResponse()
      )
      useSandboxStore.getState().addHistoryEntry(
        createRequest({ url: '/v1/second' }),
        createResponse()
      )

      const { history } = useSandboxStore.getState()
      expect(history[0]!.request.url).toBe('/v1/second')
      expect(history[1]!.request.url).toBe('/v1/first')
    })

    it('limits history to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        useSandboxStore.getState().addHistoryEntry(
          createRequest({ url: `/v1/item-${i}` }),
          createResponse()
        )
      }

      const { history } = useSandboxStore.getState()
      expect(history).toHaveLength(10)
      // Most recent should be first
      expect(history[0]!.request.url).toBe('/v1/item-14')
    })

    it('removes a history entry by id', () => {
      useSandboxStore.getState().addHistoryEntry(createRequest(), createResponse())
      useSandboxStore.getState().addHistoryEntry(createRequest(), createResponse())

      const entryId = useSandboxStore.getState().history[0]!.id
      useSandboxStore.getState().removeHistoryEntry(entryId)

      const { history } = useSandboxStore.getState()
      expect(history).toHaveLength(1)
      expect(history.find((e) => e.id === entryId)).toBeUndefined()
    })

    it('clears all history', () => {
      useSandboxStore.getState().addHistoryEntry(createRequest(), createResponse())
      useSandboxStore.getState().addHistoryEntry(createRequest(), createResponse())
      useSandboxStore.getState().addHistoryEntry(createRequest(), createResponse())

      useSandboxStore.getState().clearHistory()

      expect(useSandboxStore.getState().history).toHaveLength(0)
    })
  })

  describe('Code Language', () => {
    it('defaults to curl', () => {
      expect(useSandboxStore.getState().activeCodeLang).toBe(CodeExampleLang.Curl)
    })

    it('sets active code language', () => {
      useSandboxStore.getState().setActiveCodeLang(CodeExampleLang.Python)
      expect(useSandboxStore.getState().activeCodeLang).toBe(CodeExampleLang.Python)

      useSandboxStore.getState().setActiveCodeLang(CodeExampleLang.JavaScript)
      expect(useSandboxStore.getState().activeCodeLang).toBe(CodeExampleLang.JavaScript)
    })
  })

  describe('Code Example Generation', () => {
    it('generates curl example for GET request', () => {
      const req = createRequest({
        method: HttpMethod.Get,
        url: '/v1/documents',
        headers: '{"Authorization": "Bearer sk_test_123"}',
      })

      const code = generateCodeExample(CodeExampleLang.Curl, req)
      expect(code).toContain('curl -X GET')
      expect(code).toContain('https://api.signof.io/v1/documents')
      expect(code).toContain('Authorization: Bearer sk_test_123')
    })

    it('generates curl example for POST request with body', () => {
      const req = createRequest({
        method: HttpMethod.Post,
        url: '/v1/documents',
        headers: '{"Content-Type": "application/json"}',
        body: '{"name": "Contract"}',
      })

      const code = generateCodeExample(CodeExampleLang.Curl, req)
      expect(code).toContain('curl -X POST')
      expect(code).toContain("-d '{\"name\": \"Contract\"}'")
    })

    it('generates JavaScript fetch example', () => {
      const req = createRequest({
        method: HttpMethod.Get,
        url: '/v1/documents',
        headers: '{"Authorization": "Bearer test"}',
      })

      const code = generateCodeExample(CodeExampleLang.JavaScript, req)
      expect(code).toContain("await fetch('https://api.signof.io/v1/documents'")
      expect(code).toContain("method: 'GET'")
      expect(code).toContain('await response.json()')
    })

    it('generates JavaScript example with body for POST', () => {
      const req = createRequest({
        method: HttpMethod.Post,
        url: '/v1/documents',
        headers: '{}',
        body: '{"name": "Test"}',
      })

      const code = generateCodeExample(CodeExampleLang.JavaScript, req)
      expect(code).toContain("method: 'POST'")
      expect(code).toContain('body: JSON.stringify(')
    })

    it('generates Python example', () => {
      const req = createRequest({
        method: HttpMethod.Get,
        url: '/v1/documents',
        headers: '{"Authorization": "Bearer test"}',
      })

      const code = generateCodeExample(CodeExampleLang.Python, req)
      expect(code).toContain('import requests')
      expect(code).toContain('requests.get(')
      expect(code).toContain('https://api.signof.io/v1/documents')
      expect(code).toContain('print(response.json())')
    })

    it('generates Python example with body for POST', () => {
      const req = createRequest({
        method: HttpMethod.Post,
        url: '/v1/documents',
        headers: '{}',
        body: '{"name": "Test"}',
      })

      const code = generateCodeExample(CodeExampleLang.Python, req)
      expect(code).toContain('requests.post(')
      expect(code).toContain('payload =')
      expect(code).toContain('json=payload')
    })

    it('does not include body in GET curl example', () => {
      const req = createRequest({
        method: HttpMethod.Get,
        url: '/v1/documents',
        headers: '{}',
        body: '{"ignored": true}',
      })

      const code = generateCodeExample(CodeExampleLang.Curl, req)
      expect(code).not.toContain("-d '")
    })

    it('handles invalid JSON headers gracefully', () => {
      const req = createRequest({
        headers: 'not valid json',
      })

      const code = generateCodeExample(CodeExampleLang.Curl, req)
      expect(code).toContain('curl -X GET')
      // Should not contain -H since headers could not be parsed
      expect(code).not.toContain('-H "')
    })
  })
})
