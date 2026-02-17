// Skill-to-tool conversion and execution for Command Center gateway

import type { ToolDefinition, ChatRequest } from '../providers/index.js';
import type { LLMProvider } from '../providers/index.js';
import { getSkillHandler } from '../skills/index.js';

interface SkillDef {
  id: string;
  name: string;
  description: string;
  handler: string;
}

export function buildToolDefinitions(skills: SkillDef[]): ToolDefinition[] {
  return skills.map((skill) => ({
    name: skill.id,
    description: skill.description,
    input_schema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: `Input for the ${skill.name} skill`,
        },
      },
      required: ['input'],
    },
  }));
}

export async function executeToolCall(
  name: string,
  input: Record<string, unknown>,
  provider: LLMProvider,
  systemPrompt: string,
): Promise<string> {
  // Try real handler first
  const handler = getSkillHandler(name);
  if (handler) {
    try {
      return await handler.execute(input);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Skill execution failed';
      return `Error executing ${name}: ${message}`;
    }
  }

  // Fallback: re-prompt LLM (original behavior)
  const userInput = typeof input.input === 'string' ? input.input : JSON.stringify(input);
  const request: ChatRequest = {
    messages: [
      {
        role: 'user',
        content: `Execute the "${name}" skill with this input: ${userInput}`,
      },
    ],
    systemPrompt: `${systemPrompt}\n\nYou are executing the "${name}" skill. Provide a direct, helpful response.`,
    maxTokens: 1024,
  };

  const response = await provider.syncChat(request);
  return response.content;
}
