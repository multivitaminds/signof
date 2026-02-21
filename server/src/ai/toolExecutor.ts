// Tool Executor — server-side tool execution for AI agents

import { query } from '../db/postgres.js';
import { logger } from '../lib/logger.js';

interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

type ToolHandler = (input: Record<string, unknown>, tenantId: string) => Promise<string>;

const toolRegistry = new Map<string, ToolHandler>();

// ─── Built-in Tools ─────────────────────────────────────────────────

// Database query tool (read-only)
toolRegistry.set('query_data', async (input, tenantId) => {
  const { table, filter, limit } = input as { table?: string; filter?: Record<string, unknown>; limit?: number };

  if (!table) return 'Error: table parameter required';

  // Whitelist safe tables
  const safeTables = ['conversations', 'agent_runs', 'memory_long_term', 'memory_episodes'];
  if (!safeTables.includes(table)) return `Error: table "${table}" not accessible`;

  const maxLimit = Math.min(limit ?? 10, 50);
  const conditions: string[] = ['tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let paramIdx = 2;

  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      // Sanitize column names (alphanumeric + underscore only)
      if (/^[a-z_]+$/.test(key)) {
        conditions.push(`${key} = $${paramIdx++}`);
        params.push(value);
      }
    }
  }

  const result = await query(
    `SELECT * FROM ${table} WHERE ${conditions.join(' AND ')} LIMIT $${paramIdx}`,
    [...params, maxLimit]
  );

  return JSON.stringify(result.rows.slice(0, maxLimit));
});

// Memory search tool
toolRegistry.set('search_memory', async (input, tenantId) => {
  const { searchQuery, category, limit } = input as { searchQuery?: string; category?: string; limit?: number };

  if (!searchQuery) return 'Error: query parameter required';

  const conditions: string[] = ['tenant_id = $1', 'content ILIKE $2'];
  const params: unknown[] = [tenantId, `%${searchQuery}%`];
  let paramIdx = 3;

  if (category) {
    conditions.push(`category = $${paramIdx++}`);
    params.push(category);
  }

  const result = await query(
    `SELECT id, content, category, scope, metadata, created_at
     FROM memory_long_term
     WHERE ${conditions.join(' AND ')}
     ORDER BY access_count DESC, created_at DESC
     LIMIT $${paramIdx}`,
    [...params, Math.min(limit ?? 5, 20)]
  );

  return JSON.stringify(result.rows);
});

// Calculator tool
toolRegistry.set('calculate', async (input) => {
  const { expression } = input as { expression?: string };
  if (!expression) return 'Error: expression required';

  // Safe evaluation (numbers and basic operators only)
  if (!/^[\d\s+\-*/().%]+$/.test(expression)) {
    return 'Error: only numeric expressions with basic operators are supported';
  }

  try {
    // Using Function constructor for safe math evaluation
    const fn = new Function(`return (${expression})`);
    const result = fn() as number;
    return String(result);
  } catch {
    return 'Error: invalid expression';
  }
});

// Current time tool
toolRegistry.set('current_time', async () => {
  return new Date().toISOString();
});

/**
 * Execute a tool by name.
 */
export async function executeTools(
  toolName: string,
  input: Record<string, unknown>,
  tenantId: string
): Promise<string> {
  const handler = toolRegistry.get(toolName);
  if (!handler) {
    logger.warn('Unknown tool requested', { toolName });
    return `Tool "${toolName}" is not available`;
  }

  try {
    const result = await handler(input, tenantId);
    return result;
  } catch (err) {
    logger.error('Tool execution error', { toolName, error: (err as Error).message });
    return `Error executing ${toolName}: ${(err as Error).message}`;
  }
}

/**
 * Register a custom tool.
 */
export function registerTool(name: string, handler: ToolHandler): void {
  toolRegistry.set(name, handler);
}

/**
 * Get all available tool definitions (for LLM function calling).
 */
export function getToolDefinitions(): ToolDefinition[] {
  return [
    {
      name: 'query_data',
      description: 'Query data from the workspace database (read-only)',
      parameters: {
        type: 'object',
        properties: {
          table: { type: 'string', description: 'Table to query' },
          filter: { type: 'object', description: 'Key-value filters' },
          limit: { type: 'number', description: 'Max results (default 10)' },
        },
        required: ['table'],
      },
    },
    {
      name: 'search_memory',
      description: 'Search the workspace memory for relevant context',
      parameters: {
        type: 'object',
        properties: {
          searchQuery: { type: 'string', description: 'Search query' },
          category: { type: 'string', description: 'Memory category filter' },
          limit: { type: 'number', description: 'Max results (default 5)' },
        },
        required: ['searchQuery'],
      },
    },
    {
      name: 'calculate',
      description: 'Evaluate a mathematical expression',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Math expression to evaluate' },
        },
        required: ['expression'],
      },
    },
    {
      name: 'current_time',
      description: 'Get the current date and time',
      parameters: { type: 'object', properties: {} },
    },
  ];
}
