import { ModelId, ToolCallStatus } from '../types'
import type { ToolCall } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Per-model response personalities ───────────────────────────────

const MODEL_PERSONALITIES: Record<ModelId, (userContent: string) => string> = {
  [ModelId.ClaudeOpus]: (content) =>
    `I've carefully considered your message about "${truncate(content)}" from multiple perspectives.\n\n` +
    'This is a nuanced topic that deserves thoughtful analysis. Let me break down the key considerations:\n\n' +
    '1. **Primary implications** — The core of your question touches on fundamental principles that warrant careful examination.\n\n' +
    '2. **Alternative viewpoints** — It\'s worth considering how different stakeholders might approach this differently.\n\n' +
    '3. **Synthesis** — Bringing these perspectives together, I\'d suggest a balanced approach that accounts for both immediate needs and longer-term considerations.\n\n' +
    'I\'m happy to explore any of these dimensions in greater depth.',

  [ModelId.ClaudeSonnet]: (content) =>
    `Great question about "${truncate(content)}"! Here's my take:\n\n` +
    'The key insight here is that context matters significantly. Based on what you\'ve shared, I\'d recommend the following approach:\n\n' +
    '- Start with a clear understanding of the requirements\n' +
    '- Consider the trade-offs between simplicity and flexibility\n' +
    '- Iterate based on feedback\n\n' +
    'Would you like me to elaborate on any specific aspect?',

  [ModelId.ClaudeHaiku]: (content) =>
    `Re: "${truncate(content)}"\n\n` +
    'Here\'s a concise answer:\n\n' +
    'The most straightforward approach is to focus on the essentials. Keep it simple, measure results, and adjust as needed.\n\n' +
    'Need more detail on anything specific?',

  [ModelId.Gpt4o]: (content) =>
    `Regarding your question about "${truncate(content)}":\n\n` +
    '**Key Points:**\n' +
    '- The solution involves several interconnected components\n' +
    '- Each component can be implemented independently\n' +
    '- Testing and validation are essential at each step\n\n' +
    '**Recommended Steps:**\n' +
    '1. Define the scope and constraints\n' +
    '2. Implement the core logic\n' +
    '3. Add error handling and edge cases\n' +
    '4. Validate with real-world scenarios\n\n' +
    'Let me know if you\'d like code examples or further details.',

  [ModelId.Gpt4oMini]: (content) =>
    `About "${truncate(content)}":\n\n` +
    'Here\'s a quick breakdown:\n' +
    '- **What**: The core concept is straightforward\n' +
    '- **How**: Implementation can be done in a few steps\n' +
    '- **Why**: This approach optimizes for clarity and maintainability\n\n' +
    'Want me to go deeper on any part?',

  [ModelId.GeminiFlash]: (content) =>
    `Analyzing your query about "${truncate(content)}"...\n\n` +
    'Based on current research and best practices, here\'s what the data suggests:\n\n' +
    '**Analysis:**\n' +
    'The evidence points toward a structured approach. Studies in this domain indicate that systematic methods yield 40-60% better outcomes compared to ad-hoc solutions.\n\n' +
    '**Recommendation:** Start with a data-driven assessment, then iterate based on measurable results.',

  [ModelId.GeminiPro]: (content) =>
    `Deep analysis of "${truncate(content)}":\n\n` +
    '**Research Context:**\n' +
    'This topic has been extensively studied across multiple domains. The latest findings suggest several promising directions.\n\n' +
    '**Key Findings:**\n' +
    '1. Quantitative analysis supports the hypothesis that structured approaches outperform unstructured ones\n' +
    '2. Qualitative data reveals important nuances in implementation\n' +
    '3. Cross-domain patterns suggest universal principles at work\n\n' +
    '**Actionable Insights:**\n' +
    'Based on this analysis, I recommend a phased approach with clear metrics at each stage. I can provide detailed citations if needed.',

  [ModelId.Llama4Scout]: (content) =>
    `Hey! Let me help with "${truncate(content)}".\n\n` +
    'As an open-source model, I love sharing knowledge freely. Here\'s my perspective:\n\n' +
    'The open-source community has developed several excellent solutions for this. The most popular approach uses a combination of well-tested libraries and community-maintained tools.\n\n' +
    '**Community Resources:**\n' +
    '- Check out the relevant GitHub repositories for reference implementations\n' +
    '- The community forums have great discussion threads on best practices\n' +
    '- Several open-source projects demonstrate production-ready patterns\n\n' +
    'Open collaboration makes everyone better! Let me know if you want specific recommendations.',

  [ModelId.Grok3]: (content) =>
    `Alright, let's cut to the chase on "${truncate(content)}".\n\n` +
    'Here\'s what\'s actually going on — no fluff:\n\n' +
    '**The Real Answer:**\n' +
    'Most people overcomplicate this. The straightforward solution is usually the right one. Here\'s the play-by-play:\n\n' +
    '1. Strip out the unnecessary complexity\n' +
    '2. Focus on what actually moves the needle\n' +
    '3. Ship it and iterate based on real feedback\n\n' +
    '**Hot Take:** The best approach is often the simplest one that works. Don\'t let perfect be the enemy of done.\n\n' +
    'Want me to dig deeper or are we good? I can pull real-time data if that helps.',
}

function truncate(text: string, maxLen = 40): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}

// ─── Simulated tool calls for agent mode ────────────────────────────

const TOOL_TEMPLATES = [
  {
    name: 'web_search',
    input: (query: string) => JSON.stringify({ query: `search: ${truncate(query, 60)}` }, null, 2),
    output: () => JSON.stringify({
      results: [
        { title: 'Relevant Documentation', url: 'https://docs.example.com', snippet: 'Official documentation covering best practices...' },
        { title: 'Community Guide', url: 'https://community.example.com', snippet: 'Step-by-step guide from experienced practitioners...' },
      ],
    }, null, 2),
  },
  {
    name: 'code_interpreter',
    input: () => JSON.stringify({ code: 'analysis = process_data(input_context)\nresult = summarize(analysis)' }, null, 2),
    output: () => JSON.stringify({ result: 'Analysis complete. Found 3 key patterns and 2 optimization opportunities.' }, null, 2),
  },
  {
    name: 'file_reader',
    input: () => JSON.stringify({ path: '/workspace/context.md', lines: '1-50' }, null, 2),
    output: () => JSON.stringify({ content: '# Project Context\n\nThis document contains the relevant background information...\n[48 more lines]' }, null, 2),
  },
]

function generateToolCalls(content: string): ToolCall[] {
  const count = 1 + Math.floor(Math.random() * 3) // 1-3 tool calls
  const shuffled = [...TOOL_TEMPLATES].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)

  return selected.map((template) => ({
    id: generateId(),
    name: template.name,
    input: template.input(content),
    output: template.output(),
    status: ToolCallStatus.Completed,
    durationMs: 200 + Math.floor(Math.random() * 800),
  }))
}

// ─── Main response generator ────────────────────────────────────────

export function generateResponse(
  content: string,
  modelId: ModelId,
  agentMode: boolean,
): Promise<{ content: string; toolCalls: ToolCall[] }> {
  const delay = 500 + Math.random() * 1000

  return new Promise((resolve) => {
    setTimeout(() => {
      const personality = MODEL_PERSONALITIES[modelId]
      const responseContent = personality(content)
      const toolCalls = agentMode ? generateToolCalls(content) : []

      let finalContent = responseContent
      if (agentMode && toolCalls.length > 0) {
        finalContent += '\n\n---\n*Used ' + toolCalls.length + ' tool' + (toolCalls.length > 1 ? 's' : '') + ' to research this response.*'
      }

      resolve({ content: finalContent, toolCalls })
    }, delay)
  })
}
