// Base agent class — all server-side agents extend this

import { getUnifiedMemory } from '../memory/index.js';
import { executeTools } from '../toolExecutor.js';
import { logger } from '../../lib/logger.js';

export interface AgentContext {
  tenantId: string;
  userId: string;
  conversationId: string;
  model: string;
  provider: string;
}

export interface AgentStep {
  type: 'thinking' | 'tool_call' | 'response';
  content: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: string;
  timestamp: number;
}

export abstract class BaseAgent {
  readonly type: string;
  readonly description: string;
  protected context: AgentContext | null = null;
  protected steps: AgentStep[] = [];

  constructor(type: string, description: string) {
    this.type = type;
    this.description = description;
  }

  /**
   * Initialize agent with context.
   */
  init(context: AgentContext): void {
    this.context = context;
    this.steps = [];
  }

  /**
   * Get the system prompt for this agent type.
   */
  abstract getSystemPrompt(): string;

  /**
   * Get available tools for this agent type.
   */
  getAvailableTools(): string[] {
    return ['search_memory', 'current_time'];
  }

  /**
   * Execute a tool.
   */
  protected async executeTool(name: string, input: Record<string, unknown>): Promise<string> {
    if (!this.context) throw new Error('Agent not initialized');

    const step: AgentStep = {
      type: 'tool_call',
      content: `Calling ${name}`,
      toolName: name,
      toolInput: input,
      timestamp: Date.now(),
    };

    const result = await executeTools(name, input, this.context.tenantId);
    step.toolOutput = result;
    this.steps.push(step);

    return result;
  }

  /**
   * Get memory context for this agent's task.
   */
  protected async getMemoryContext(taskDescription: string): Promise<string> {
    if (!this.context) return '';

    const memory = getUnifiedMemory();
    return memory.getRelevantContext(
      this.context.tenantId,
      this.context.userId,
      taskDescription
    );
  }

  /**
   * Record a thinking step.
   */
  protected think(thought: string): void {
    this.steps.push({
      type: 'thinking',
      content: thought,
      timestamp: Date.now(),
    });
    logger.debug(`Agent ${this.type} thinking`, { thought: thought.slice(0, 100) });
  }

  /**
   * Get all steps taken during this agent's execution.
   */
  getSteps(): AgentStep[] {
    return [...this.steps];
  }
}
