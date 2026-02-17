// Pure TypeScript TF-IDF implementation for task routing

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because',
  'if', 'when', 'where', 'how', 'all', 'any', 'this', 'that', 'these',
  'those', 'it', 'its', 'he', 'she', 'they', 'them', 'we', 'you',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1)
  }
  // Normalize by document length
  const len = tokens.length
  if (len > 0) {
    for (const [term, count] of freq) {
      freq.set(term, count / len)
    }
  }
  return freq
}

interface IndexedDocument {
  id: string
  tf: Map<string, number>
  tokens: string[]
}

export class TFIDFIndex {
  private documents: IndexedDocument[] = []
  private documentFrequency = new Map<string, number>()

  addDocument(id: string, text: string): void {
    const tokens = tokenize(text)
    const tf = termFrequency(tokens)

    // Update document frequency
    const uniqueTerms = new Set(tokens)
    for (const term of uniqueTerms) {
      this.documentFrequency.set(term, (this.documentFrequency.get(term) ?? 0) + 1)
    }

    this.documents.push({ id, tf, tokens })
  }

  search(query: string, topK: number = 10): Array<{ id: string; score: number }> {
    const queryTokens = tokenize(query)
    if (queryTokens.length === 0) return []

    const queryTF = termFrequency(queryTokens)
    const N = this.documents.length
    if (N === 0) return []

    const results: Array<{ id: string; score: number }> = []

    for (const doc of this.documents) {
      let score = 0

      for (const [term, queryWeight] of queryTF) {
        const docWeight = doc.tf.get(term) ?? 0
        if (docWeight === 0) continue

        const df = this.documentFrequency.get(term) ?? 0
        const idf = df > 0 ? Math.log(N / df) : 0
        score += queryWeight * docWeight * idf
      }

      if (score > 0) {
        results.push({ id: doc.id, score })
      }
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, topK)
  }

  get size(): number {
    return this.documents.length
  }
}
