import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SandboxRequest, SandboxResponse } from '../types'

// ─── History Entry ──────────────────────────────────────────────────────

export interface SandboxHistoryEntry {
  id: string
  request: SandboxRequest
  response: SandboxResponse
  timestamp: string
}

// ─── Code Example Language ──────────────────────────────────────────────

export const CodeExampleLang = {
  Curl: 'curl',
  JavaScript: 'javascript',
  Python: 'python',
} as const

export type CodeExampleLang = (typeof CodeExampleLang)[keyof typeof CodeExampleLang]

// ─── Code Example Generator ────────────────────────────────────────────

export function generateCodeExample(
  lang: CodeExampleLang,
  request: SandboxRequest
): string {
  const parsedHeaders = tryParseJson(request.headers)

  switch (lang) {
    case CodeExampleLang.Curl: {
      let cmd = `curl -X ${request.method} "https://api.orchestree.io${request.url}"`
      if (parsedHeaders) {
        for (const [key, value] of Object.entries(parsedHeaders)) {
          cmd += ` \\\n  -H "${key}: ${value as string}"`
        }
      }
      if (request.body && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        cmd += ` \\\n  -d '${request.body}'`
      }
      return cmd
    }
    case CodeExampleLang.JavaScript: {
      const opts: string[] = []
      opts.push(`  method: '${request.method}',`)
      if (parsedHeaders) {
        opts.push(`  headers: ${JSON.stringify(parsedHeaders, null, 4).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')},`)
      }
      if (request.body && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        opts.push(`  body: JSON.stringify(${request.body.trim()}),`)
      }
      return `const response = await fetch('https://api.orchestree.io${request.url}', {\n${opts.join('\n')}\n});\n\nconst data = await response.json();\nconsole.log(data);`
    }
    case CodeExampleLang.Python: {
      let code = `import requests\n\n`
      if (parsedHeaders) {
        code += `headers = ${JSON.stringify(parsedHeaders, null, 4)}\n\n`
      }
      if (request.body && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        code += `payload = ${request.body.trim()}\n\n`
        code += `response = requests.${request.method.toLowerCase()}(\n    "https://api.orchestree.io${request.url}",\n    headers=headers,\n    json=payload\n)\n`
      } else {
        code += `response = requests.${request.method.toLowerCase()}(\n    "https://api.orchestree.io${request.url}",\n    headers=headers\n)\n`
      }
      code += `\nprint(response.json())`
      return code
    }
    default:
      return ''
  }
}

function tryParseJson(str: string): Record<string, unknown> | null {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

// ─── ID Generator ───────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Store ──────────────────────────────────────────────────────────────

const MAX_HISTORY = 10

interface SandboxState {
  history: SandboxHistoryEntry[]
  activeCodeLang: CodeExampleLang

  // Actions
  addHistoryEntry: (request: SandboxRequest, response: SandboxResponse) => void
  clearHistory: () => void
  removeHistoryEntry: (id: string) => void
  setActiveCodeLang: (lang: CodeExampleLang) => void
}

export const useSandboxStore = create<SandboxState>()(
  persist(
    (set) => ({
      history: [],
      activeCodeLang: CodeExampleLang.Curl,

      addHistoryEntry: (request, response) =>
        set((state) => {
          const entry: SandboxHistoryEntry = {
            id: generateId(),
            request,
            response,
            timestamp: new Date().toISOString(),
          }
          const newHistory = [entry, ...state.history].slice(0, MAX_HISTORY)
          return { history: newHistory }
        }),

      clearHistory: () => set({ history: [] }),

      removeHistoryEntry: (id) =>
        set((state) => ({
          history: state.history.filter((e) => e.id !== id),
        })),

      setActiveCodeLang: (lang) => set({ activeCodeLang: lang }),
    }),
    {
      name: 'orchestree-sandbox-storage',
      partialize: (state) => ({
        history: state.history,
        activeCodeLang: state.activeCodeLang,
      }),
    }
  )
)
