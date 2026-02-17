// Skill-to-tool conversion and execution for Command Center gateway

import type { ToolDefinition, ChatRequest } from '../providers/index.js';
import type { LLMProvider } from '../providers/index.js';

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
