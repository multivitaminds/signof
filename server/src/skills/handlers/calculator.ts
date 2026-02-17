import type { SkillHandler } from '../index.js';

function evaluate(expr: string): number {
  const tokens = tokenize(expr);
  const result = parseExpression(tokens, { pos: 0 });
  return result;
}

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i]!)) { i++; continue; }
    if ('+-*/()'.includes(expr[i]!)) {
      tokens.push(expr[i]!);
      i++;
    } else if (/[\d.]/.test(expr[i]!)) {
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i]!)) {
        num += expr[i]!;
        i++;
      }
      tokens.push(num);
    } else {
      throw new Error(`Unexpected character: ${expr[i]}`);
    }
  }
  return tokens;
}

function parseExpression(tokens: string[], ctx: { pos: number }): number {
  let left = parseTerm(tokens, ctx);
  while (ctx.pos < tokens.length && (tokens[ctx.pos] === '+' || tokens[ctx.pos] === '-')) {
    const op = tokens[ctx.pos]!;
    ctx.pos++;
    const right = parseTerm(tokens, ctx);
    left = op === '+' ? left + right : left - right;
  }
  return left;
}

function parseTerm(tokens: string[], ctx: { pos: number }): number {
  let left = parseFactor(tokens, ctx);
  while (ctx.pos < tokens.length && (tokens[ctx.pos] === '*' || tokens[ctx.pos] === '/')) {
    const op = tokens[ctx.pos]!;
    ctx.pos++;
    const right = parseFactor(tokens, ctx);
    if (op === '/' && right === 0) throw new Error('Division by zero');
    left = op === '*' ? left * right : left / right;
  }
  return left;
}

function parseFactor(tokens: string[], ctx: { pos: number }): number {
  if (ctx.pos >= tokens.length) throw new Error('Unexpected end of expression');
  const token = tokens[ctx.pos]!;
  if (token === '(') {
    ctx.pos++;
    const result = parseExpression(tokens, ctx);
    if (tokens[ctx.pos] !== ')') throw new Error('Missing closing parenthesis');
    ctx.pos++;
    return result;
  }
  // Handle unary minus
  if (token === '-') {
    ctx.pos++;
    return -parseFactor(tokens, ctx);
  }
  const num = parseFloat(token);
  if (isNaN(num)) throw new Error(`Invalid number: ${token}`);
  ctx.pos++;
  return num;
}

export const calculatorHandler: SkillHandler = {
  async execute(input: Record<string, unknown>): Promise<string> {
    const expr = typeof input.input === 'string' ? input.input : String(input.expression ?? input.input ?? '');
    if (!expr.trim()) return 'Error: No expression provided';
    try {
      const result = evaluate(expr);
      return String(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Calculation failed';
      return `Error: ${msg}`;
    }
  },
};
