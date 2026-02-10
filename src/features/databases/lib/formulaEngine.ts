import type { DbRow, DbField, CellValue } from '../types'

// ─── Token Types ────────────────────────────────────────────────────

const TokenType = {
  Number: 'number',
  String: 'string',
  Boolean: 'boolean',
  FieldRef: 'field_ref',
  Operator: 'operator',
  Paren: 'paren',
  Comma: 'comma',
  Function: 'function',
} as const

type TokenType = (typeof TokenType)[keyof typeof TokenType]

interface Token {
  type: TokenType
  value: string
}

// ─── Tokenizer ──────────────────────────────────────────────────────

const FUNCTIONS = new Set([
  'IF', 'AND', 'OR', 'NOT',
  'CONCAT', 'UPPER', 'LOWER', 'LEN', 'TRIM',
  'SUM', 'ABS', 'ROUND', 'FLOOR', 'CEIL',
  'NOW', 'TODAY', 'DAYS',
])

function tokenize(expression: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < expression.length) {
    const ch = expression[i]!

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++
      continue
    }

    // Field reference: {Field Name}
    if (ch === '{') {
      const end = expression.indexOf('}', i + 1)
      if (end === -1) throw new Error('Unclosed field reference')
      tokens.push({ type: TokenType.FieldRef, value: expression.slice(i + 1, end) })
      i = end + 1
      continue
    }

    // String literal: 'text' or "text"
    if (ch === '\'' || ch === '"') {
      const quote = ch
      let str = ''
      i++
      while (i < expression.length && expression[i] !== quote) {
        str += expression[i]
        i++
      }
      if (i >= expression.length) throw new Error('Unterminated string')
      i++ // skip closing quote
      tokens.push({ type: TokenType.String, value: str })
      continue
    }

    // Number literal
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < expression.length && /[0-9]/.test(expression[i + 1]!))) {
      let num = ''
      while (i < expression.length && (/[0-9]/.test(expression[i]!) || expression[i] === '.')) {
        num += expression[i]
        i++
      }
      tokens.push({ type: TokenType.Number, value: num })
      continue
    }

    // Parentheses
    if (ch === '(' || ch === ')') {
      tokens.push({ type: TokenType.Paren, value: ch })
      i++
      continue
    }

    // Comma
    if (ch === ',') {
      tokens.push({ type: TokenType.Comma, value: ',' })
      i++
      continue
    }

    // Multi-char operators: >=, <=, ==, !=
    if (i + 1 < expression.length) {
      const two = expression.slice(i, i + 2)
      if (two === '>=' || two === '<=' || two === '==' || two === '!=') {
        tokens.push({ type: TokenType.Operator, value: two })
        i += 2
        continue
      }
    }

    // Single-char operators
    if ('+-*/%><='.includes(ch)) {
      tokens.push({ type: TokenType.Operator, value: ch })
      i++
      continue
    }

    // Identifiers (function names, booleans)
    if (/[a-zA-Z_]/.test(ch)) {
      let ident = ''
      while (i < expression.length && /[a-zA-Z0-9_]/.test(expression[i]!)) {
        ident += expression[i]
        i++
      }
      const upper = ident.toUpperCase()
      if (upper === 'TRUE' || upper === 'FALSE') {
        tokens.push({ type: TokenType.Boolean, value: upper === 'TRUE' ? 'true' : 'false' })
      } else if (FUNCTIONS.has(upper)) {
        tokens.push({ type: TokenType.Function, value: upper })
      } else {
        // Treat as string literal (unquoted identifier)
        tokens.push({ type: TokenType.String, value: ident })
      }
      continue
    }

    throw new Error(`Unexpected character: ${ch}`)
  }

  return tokens
}

// ─── Parser & Evaluator (recursive descent) ─────────────────────────

type FormulaValue = string | number | boolean | null

interface ParseContext {
  tokens: Token[]
  pos: number
  row: DbRow
  fieldMap: Map<string, DbField>
}

function peek(ctx: ParseContext): Token | undefined {
  return ctx.tokens[ctx.pos]
}

function advance(ctx: ParseContext): Token {
  const token = ctx.tokens[ctx.pos]
  if (!token) throw new Error('Unexpected end of expression')
  ctx.pos++
  return token
}

function resolveFieldRef(name: string, ctx: ParseContext): FormulaValue {
  const field = ctx.fieldMap.get(name)
  if (!field) throw new Error(`Unknown field: ${name}`)
  const val = ctx.row.cells[field.id]
  if (val === null || val === undefined) return null
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val
  if (Array.isArray(val)) return val.join(', ')
  return val
}

function toNumber(val: FormulaValue): number {
  if (val === null) return 0
  if (typeof val === 'boolean') return val ? 1 : 0
  if (typeof val === 'number') return val
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function toBool(val: FormulaValue): boolean {
  if (val === null) return false
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val !== 0
  return val !== ''
}

function toString(val: FormulaValue): string {
  if (val === null) return ''
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  return String(val)
}

// Parse comma-separated arguments inside parentheses
function parseArgs(ctx: ParseContext): FormulaValue[] {
  const args: FormulaValue[] = []
  // Expect opening paren
  const open = advance(ctx)
  if (open.type !== TokenType.Paren || open.value !== '(') {
    throw new Error('Expected (')
  }

  // Handle empty args: NOW(), TODAY()
  const next = peek(ctx)
  if (next && next.type === TokenType.Paren && next.value === ')') {
    advance(ctx)
    return args
  }

  args.push(parseExpression(ctx))
  while (peek(ctx)?.type === TokenType.Comma) {
    advance(ctx) // consume comma
    args.push(parseExpression(ctx))
  }

  const close = advance(ctx)
  if (close.type !== TokenType.Paren || close.value !== ')') {
    throw new Error('Expected )')
  }
  return args
}

function evaluateFunction(name: string, ctx: ParseContext): FormulaValue {
  const args = parseArgs(ctx)

  switch (name) {
    case 'IF': {
      if (args.length < 3) throw new Error('IF requires 3 arguments')
      return toBool(args[0]!) ? args[1]! : args[2]!
    }
    case 'AND': {
      return args.every((a) => toBool(a))
    }
    case 'OR': {
      return args.some((a) => toBool(a))
    }
    case 'NOT': {
      if (args.length < 1) throw new Error('NOT requires 1 argument')
      return !toBool(args[0]!)
    }
    case 'CONCAT': {
      return args.map((a) => toString(a)).join('')
    }
    case 'UPPER': {
      if (args.length < 1) throw new Error('UPPER requires 1 argument')
      return toString(args[0]!).toUpperCase()
    }
    case 'LOWER': {
      if (args.length < 1) throw new Error('LOWER requires 1 argument')
      return toString(args[0]!).toLowerCase()
    }
    case 'LEN': {
      if (args.length < 1) throw new Error('LEN requires 1 argument')
      return toString(args[0]!).length
    }
    case 'TRIM': {
      if (args.length < 1) throw new Error('TRIM requires 1 argument')
      return toString(args[0]!).trim()
    }
    case 'SUM': {
      return args.reduce((acc: number, a) => acc + toNumber(a), 0)
    }
    case 'ABS': {
      if (args.length < 1) throw new Error('ABS requires 1 argument')
      return Math.abs(toNumber(args[0]!))
    }
    case 'ROUND': {
      if (args.length < 1) throw new Error('ROUND requires 1 argument')
      const decimals = args.length >= 2 ? toNumber(args[1]!) : 0
      const factor = Math.pow(10, decimals)
      return Math.round(toNumber(args[0]!) * factor) / factor
    }
    case 'FLOOR': {
      if (args.length < 1) throw new Error('FLOOR requires 1 argument')
      return Math.floor(toNumber(args[0]!))
    }
    case 'CEIL': {
      if (args.length < 1) throw new Error('CEIL requires 1 argument')
      return Math.ceil(toNumber(args[0]!))
    }
    case 'NOW': {
      return new Date().toISOString()
    }
    case 'TODAY': {
      return new Date().toISOString().split('T')[0]!
    }
    case 'DAYS': {
      if (args.length < 2) throw new Error('DAYS requires 2 arguments')
      const d1 = new Date(toString(args[0]!))
      const d2 = new Date(toString(args[1]!))
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        throw new Error('Invalid date in DAYS')
      }
      const diffMs = Math.abs(d1.getTime() - d2.getTime())
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    }
    default:
      throw new Error(`Unknown function: ${name}`)
  }
}

// Primary: number, string, boolean, field ref, function call, parenthesized expr
function parsePrimary(ctx: ParseContext): FormulaValue {
  const token = peek(ctx)
  if (!token) throw new Error('Unexpected end of expression')

  if (token.type === TokenType.Number) {
    advance(ctx)
    return Number(token.value)
  }

  if (token.type === TokenType.String) {
    advance(ctx)
    return token.value
  }

  if (token.type === TokenType.Boolean) {
    advance(ctx)
    return token.value === 'true'
  }

  if (token.type === TokenType.FieldRef) {
    advance(ctx)
    return resolveFieldRef(token.value, ctx)
  }

  if (token.type === TokenType.Function) {
    advance(ctx)
    return evaluateFunction(token.value, ctx)
  }

  if (token.type === TokenType.Paren && token.value === '(') {
    advance(ctx)
    const val = parseExpression(ctx)
    const close = advance(ctx)
    if (close.type !== TokenType.Paren || close.value !== ')') {
      throw new Error('Expected )')
    }
    return val
  }

  // Unary minus
  if (token.type === TokenType.Operator && token.value === '-') {
    advance(ctx)
    const val = parsePrimary(ctx)
    return -toNumber(val)
  }

  throw new Error(`Unexpected token: ${token.value}`)
}

// Multiplicative: *, /, %
function parseMultiplicative(ctx: ParseContext): FormulaValue {
  let left = parsePrimary(ctx)

  while (peek(ctx)?.type === TokenType.Operator &&
         (peek(ctx)!.value === '*' || peek(ctx)!.value === '/' || peek(ctx)!.value === '%')) {
    const op = advance(ctx).value
    const right = parsePrimary(ctx)
    const l = toNumber(left)
    const r = toNumber(right)
    if (op === '*') left = l * r
    else if (op === '/') {
      if (r === 0) throw new Error('Division by zero')
      left = l / r
    }
    else if (op === '%') {
      if (r === 0) throw new Error('Division by zero')
      left = l % r
    }
  }

  return left
}

// Additive: +, -
function parseAdditive(ctx: ParseContext): FormulaValue {
  let left = parseMultiplicative(ctx)

  while (peek(ctx)?.type === TokenType.Operator &&
         (peek(ctx)!.value === '+' || peek(ctx)!.value === '-')) {
    const op = advance(ctx).value
    const right = parseMultiplicative(ctx)
    if (op === '+') {
      // String concatenation if either side is a string
      if (typeof left === 'string' || typeof right === 'string') {
        left = toString(left) + toString(right)
      } else {
        left = toNumber(left) + toNumber(right)
      }
    } else {
      left = toNumber(left) - toNumber(right)
    }
  }

  return left
}

// Comparison: >, <, >=, <=, ==, !=
function parseComparison(ctx: ParseContext): FormulaValue {
  let left = parseAdditive(ctx)

  while (peek(ctx)?.type === TokenType.Operator &&
         (peek(ctx)!.value === '>' || peek(ctx)!.value === '<' ||
          peek(ctx)!.value === '>=' || peek(ctx)!.value === '<=' ||
          peek(ctx)!.value === '==' || peek(ctx)!.value === '!=')) {
    const op = advance(ctx).value
    const right = parseAdditive(ctx)

    switch (op) {
      case '>':  left = toNumber(left) > toNumber(right); break
      case '<':  left = toNumber(left) < toNumber(right); break
      case '>=': left = toNumber(left) >= toNumber(right); break
      case '<=': left = toNumber(left) <= toNumber(right); break
      case '==': left = toString(left) === toString(right); break
      case '!=': left = toString(left) !== toString(right); break
    }
  }

  return left
}

// Top-level expression
function parseExpression(ctx: ParseContext): FormulaValue {
  return parseComparison(ctx)
}

// ─── Public API ─────────────────────────────────────────────────────

export function evaluateFormula(
  expression: string,
  row: DbRow,
  fields: DbField[]
): CellValue {
  try {
    if (!expression.trim()) return null

    const fieldMap = new Map<string, DbField>()
    for (const field of fields) {
      fieldMap.set(field.name, field)
    }

    const tokens = tokenize(expression)
    const ctx: ParseContext = { tokens, pos: 0, row, fieldMap }
    const result = parseExpression(ctx)

    // Ensure all tokens were consumed
    if (ctx.pos < tokens.length) {
      throw new Error(`Unexpected token: ${tokens[ctx.pos]!.value}`)
    }

    if (result === null) return null
    if (typeof result === 'boolean') return result
    if (typeof result === 'number') return result
    return String(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return `#ERROR: ${message}`
  }
}
