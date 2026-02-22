import { isLLMAvailable, syncChat } from './llmClient'

export async function copilotChat(
  moduleName: string,
  userMessage: string,
  contextSummary: string,
  fallbackFn: () => string,
): Promise<string> {
  if (!isLLMAvailable()) return fallbackFn()

  const systemPrompt = [
    `You are the OriginA ${moduleName} Copilot.`,
    `Help the user with their request. Be concise and actionable.`,
    `Current context: ${contextSummary}`,
  ].join('\n')

  try {
    const response = await syncChat({
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt,
    })

    return response ?? fallbackFn()
  } catch {
    return fallbackFn()
  }
}

export async function copilotAnalysis(
  moduleName: string,
  analysisType: string,
  dataContext: string,
  fallbackFn: () => { summary: string; items: string[] },
): Promise<{ summary: string; items: string[] }> {
  if (!isLLMAvailable()) return fallbackFn()

  const systemPrompt = [
    `You are the OriginA ${moduleName} Copilot performing a ${analysisType} analysis.`,
    `Analyze the following data and return a JSON object: { "summary": "one line", "items": ["bullet 1", "bullet 2", ...] }`,
    `Data:\n${dataContext}`,
  ].join('\n')

  try {
    const response = await syncChat({
      messages: [{ role: 'user', content: `Run ${analysisType} analysis` }],
      systemPrompt,
    })

    if (response) {
      try {
        return JSON.parse(response) as { summary: string; items: string[] }
      } catch {
        return { summary: response.slice(0, 120), items: [response] }
      }
    }

    return fallbackFn()
  } catch {
    return fallbackFn()
  }
}
