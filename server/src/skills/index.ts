export interface SkillHandler {
  execute(input: Record<string, unknown>): Promise<string>;
}

const handlers = new Map<string, SkillHandler>();

export function registerSkill(name: string, handler: SkillHandler): void {
  handlers.set(name, handler);
}

export function getSkillHandler(name: string): SkillHandler | undefined {
  return handlers.get(name);
}

// Register built-in handlers
import { calculatorHandler } from './handlers/calculator.js';
import { httpRequestHandler } from './handlers/httpRequest.js';
import { webSearchHandler } from './handlers/webSearch.js';

registerSkill('calculator', calculatorHandler);
registerSkill('calc', calculatorHandler);
registerSkill('http_request', httpRequestHandler);
registerSkill('http', httpRequestHandler);
registerSkill('web_search', webSearchHandler);
registerSkill('search', webSearchHandler);
