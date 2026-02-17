// Core AI response pipeline for Command Center gateway

import { getDefaultProvider } from '../providers/index.js';
import type { ChatMessage, ChatRequest } from '../providers/index.js';
import { addMessage, getMessages } from './sessionStore.js';
import { buildToolDefinitions, executeToolCall } from './skillExecutor.js';

interface SoulConfig {
  name: string;
  personality: string;
  systemPrompt: string;
  rules: string[];
  context: string[];
  responseStyle: string;
  language: string;
  timezone: string;
}

interface SkillInput {
  id: string;
  name: string;
  description: string;
  handler: string;
}

export interface IncomingMessage {
  sessionId: string;
  content: string;
  soulConfig?: SoulConfig;
  skills?: SkillInput[];
  senderName?: string;
  channelId?: string;
  channelType?: string;
}

function buildSystemPrompt(config?: SoulConfig): string {
  if (!config) {
    return 'You are a helpful assistant.';
  }

  const parts: string[] = [];

  if (config.systemPrompt) {
    parts.push(config.systemPrompt);
  }

  if (config.personality) {
    parts.push(`Personality: ${config.personality}`);
  }

  if (config.rules.length > 0) {
    parts.push(`Rules:\n${config.rules.map((r) => `- ${r}`).join('\n')}`);
  }

  if (config.context.length > 0) {
    parts.push(`Context:\n${config.context.map((c) => `- ${c}`).join('\n')}`);
  }

  if (config.responseStyle) {
    parts.push(`Response style: ${config.responseStyle}`);
  }

  if (config.language) {
    parts.push(`Respond in: ${config.language}`);
  }

  if (config.timezone) {
    parts.push(`User timezone: ${config.timezone}`);
  }

  return parts.join('\n\n');
}

export async function handleChatMessage(msg: IncomingMessage): Promise<{
  content: string;
  toolCalls?: string[];
  agentId?: string | null;
  usage?: { inputTokens: number; outputTokens: number };
}> {
  const providerResult = getDefaultProvider();
  if (!providerResult) {
    return { content: 'No LLM provider is configured. Please set an API key in the server environment.' };
  }

  const { provider } = providerResult;

  // 1. Store the user message
  addMessage({
    sessionId: msg.sessionId,
    channelId: msg.channelId ?? 'webchat',
    channelType: msg.channelType ?? 'webchat',
    direction: 'inbound',
    content: msg.content,
    senderName: msg.senderName ?? 'User',
  });

  // 2. Build system prompt from soulConfig
  const systemPrompt = buildSystemPrompt(msg.soulConfig);

  // 3. Get conversation history
  const storedMessages = getMessages(msg.sessionId);
  const chatHistory: ChatMessage[] = storedMessages
    .filter((m) => m.direction === 'inbound' || m.direction === 'outbound')
    .map((m) => ({
      role: (m.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));

  // 4. Build tool definitions from skills if any
  const tools = msg.skills && msg.skills.length > 0
    ? buildToolDefinitions(msg.skills)
    : undefined;

  // 5. Call provider
  const request: ChatRequest = {
    messages: chatHistory,
    systemPrompt,
    tools,
  };

  const response = await provider.syncChat(request);

  // 6. Handle tool calls if present
  const executedToolCalls: string[] = [];

  if (response.toolCalls && response.toolCalls.length > 0) {
    const toolResults: string[] = [];

    for (const tc of response.toolCalls) {
      executedToolCalls.push(tc.name);
      const result = await executeToolCall(tc.name, tc.input, provider, systemPrompt);
      toolResults.push(`[${tc.name}]: ${result}`);
    }

    // Re-call LLM with tool results
    const followUpMessages: ChatMessage[] = [
      ...chatHistory,
      { role: 'assistant', content: response.content || 'Let me use some tools to help with that.' },
      { role: 'user', content: `Tool results:\n${toolResults.join('\n')}` },
    ];

    const followUpRequest: ChatRequest = {
      messages: followUpMessages,
      systemPrompt,
    };

    const followUp = await provider.syncChat(followUpRequest);

    // 7. Store the AI response
    addMessage({
      sessionId: msg.sessionId,
      channelId: msg.channelId ?? 'webchat',
      channelType: msg.channelType ?? 'webchat',
      direction: 'outbound',
      content: followUp.content,
      senderName: msg.soulConfig?.name ?? 'Assistant',
      toolCalls: executedToolCalls,
    });

    return {
      content: followUp.content,
      toolCalls: executedToolCalls,
      usage: followUp.usage,
    };
  }

  // 7. Store the AI response (no tool calls)
  addMessage({
    sessionId: msg.sessionId,
    channelId: msg.channelId ?? 'webchat',
    channelType: msg.channelType ?? 'webchat',
    direction: 'outbound',
    content: response.content,
    senderName: msg.soulConfig?.name ?? 'Assistant',
  });

  return { content: response.content, usage: response.usage };
}
