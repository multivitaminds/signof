import { useState, useCallback, useMemo } from 'react'
import { Copy, Check } from 'lucide-react'
import './CodeBlock.css'

// ─── Syntax Highlighting ──────────────────────────────────────────

interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'builtin' | 'function' | 'constant' | 'operator' | 'type' | 'plain'
  text: string
}

const KEYWORDS: Record<string, Set<string>> = {
  javascript: new Set([
    'import', 'export', 'from', 'const', 'let', 'var', 'function', 'return',
    'if', 'else', 'for', 'while', 'class', 'new', 'async', 'await', 'try',
    'catch', 'throw', 'default', 'typeof', 'null', 'undefined', 'true', 'false',
  ]),
  python: new Set([
    'import', 'from', 'def', 'class', 'return', 'if', 'elif', 'else', 'for',
    'while', 'try', 'except', 'raise', 'with', 'as', 'None', 'True', 'False',
    'and', 'or', 'not', 'in', 'is', 'lambda', 'pass', 'yield',
  ]),
  ruby: new Set([
    'require', 'def', 'end', 'class', 'module', 'if', 'elsif', 'else', 'unless',
    'do', 'while', 'for', 'return', 'nil', 'true', 'false', 'puts', 'print',
    'self', 'yield', 'begin', 'rescue', 'ensure', 'raise',
  ]),
  go: new Set([
    'package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface',
    'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default',
    'defer', 'go', 'chan', 'map', 'nil', 'true', 'false', 'err',
  ]),
  java: new Set([
    'import', 'public', 'private', 'protected', 'static', 'final', 'class',
    'interface', 'extends', 'implements', 'new', 'return', 'if', 'else',
    'for', 'while', 'try', 'catch', 'throw', 'throws', 'void', 'null',
    'true', 'false', 'this', 'super',
  ]),
  bash: new Set([
    'export', 'echo', 'cd', 'sudo', 'npm', 'pip', 'gem', 'go', 'git',
    'curl', 'mkdir', 'install', 'run', 'build',
  ]),
  xml: new Set([]),
}

const BUILTINS: Record<string, Set<string>> = {
  javascript: new Set(['console', 'process', 'JSON', 'Promise', 'Error', 'Object', 'Array', 'String', 'Number', 'Math', 'Date']),
  python: new Set(['print', 'os', 'str', 'int', 'float', 'list', 'dict', 'set', 'len', 'range', 'type', 'super']),
  ruby: new Set(['puts', 'print', 'ENV', 'File', 'Hash', 'Array', 'String', 'Integer']),
  go: new Set(['fmt', 'log', 'os', 'time', 'error', 'string', 'int', 'int64', 'bool']),
  java: new Set(['System', 'String', 'Integer', 'Boolean', 'List', 'Map', 'Set']),
  bash: new Set([]),
  xml: new Set([]),
}

function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = []
  const keywords = KEYWORDS[language] ?? KEYWORDS.javascript!
  const builtins = BUILTINS[language] ?? new Set()
  let i = 0

  while (i < line.length) {
    // Comments: // or #
    if (
      (line[i] === '/' && line[i + 1] === '/') ||
      (line[i] === '#' && language !== 'xml')
    ) {
      tokens.push({ type: 'comment', text: line.slice(i) })
      break
    }

    // XML tags
    if (language === 'xml' && line[i] === '<') {
      const end = line.indexOf('>', i)
      if (end !== -1) {
        tokens.push({ type: 'keyword', text: line.slice(i, end + 1) })
        i = end + 1
        continue
      }
    }

    // Strings: ' " `
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i]!
      let j = i + 1
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++ // skip escaped chars
        j++
      }
      tokens.push({ type: 'string', text: line.slice(i, j + 1) })
      i = j + 1
      continue
    }

    // Numbers
    if (/\d/.test(line[i]!)) {
      let j = i
      while (j < line.length && /[\d.]/.test(line[j]!)) j++
      tokens.push({ type: 'number', text: line.slice(i, j) })
      i = j
      continue
    }

    // Words (identifiers, keywords, etc.)
    if (/[a-zA-Z_$]/.test(line[i]!)) {
      let j = i
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j]!)) j++
      const word = line.slice(i, j)

      // Check if it's followed by ( — function call
      const nextNonSpace = line.slice(j).match(/^\s*\(/)

      if (keywords.has(word)) {
        tokens.push({ type: 'keyword', text: word })
      } else if (builtins.has(word)) {
        tokens.push({ type: 'builtin', text: word })
      } else if (/^[A-Z][A-Z0-9_]+$/.test(word)) {
        // SCREAMING_CASE constants
        tokens.push({ type: 'constant', text: word })
      } else if (/^[A-Z]/.test(word) && word.length > 1) {
        // PascalCase — type/class name
        tokens.push({ type: 'type', text: word })
      } else if (nextNonSpace) {
        // followed by ( — function call
        tokens.push({ type: 'function', text: word })
      } else {
        tokens.push({ type: 'plain', text: word })
      }

      i = j
      continue
    }

    // Operators
    if ('=>{}<>!&|+-*/%:;,.()[]?'.includes(line[i]!)) {
      // Batch consecutive operators
      let j = i
      while (j < line.length && '=>{}<>!&|+-*/%:;,.()[]?'.includes(line[j]!)) j++
      tokens.push({ type: 'operator', text: line.slice(i, j) })
      i = j
      continue
    }

    // Whitespace and other characters
    tokens.push({ type: 'plain', text: line[i]! })
    i++
  }

  return tokens
}

// ─── Component ──────────────────────────────────────────────────

interface CodeBlockProps {
  code: string
  language: string
  showLineNumbers?: boolean
}

function CodeBlock({ code, language, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  const lines = code.split('\n')

  const highlightedLines = useMemo(
    () => lines.map((line) => tokenizeLine(line, language)),
    [lines, language]
  )

  const renderTokens = useCallback((tokens: Token[]) => {
    return tokens.map((token, i) => {
      if (token.type === 'plain') return <span key={i}>{token.text}</span>
      return (
        <span key={i} className={`code-block__token--${token.type}`}>
          {token.text}
        </span>
      )
    })
  }, [])

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__language">{language}</span>
        <button
          className="code-block__copy"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          type="button"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="code-block__body">
        <pre className="code-block__pre">
          <code className="code-block__code">
            {showLineNumbers ? (
              highlightedLines.map((tokens, i) => (
                <div className="code-block__line" key={i}>
                  <span className="code-block__line-number">{i + 1}</span>
                  <span className="code-block__line-content">
                    {renderTokens(tokens)}
                  </span>
                </div>
              ))
            ) : (
              highlightedLines.map((tokens, i) => (
                <div key={i}>
                  {renderTokens(tokens)}
                  {i < highlightedLines.length - 1 ? '\n' : ''}
                </div>
              ))
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
