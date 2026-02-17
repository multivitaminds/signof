import type { TextItem } from 'pdfjs-dist/types/src/display/api'

/**
 * Extract text content from a PDF file using pdfjs-dist.
 * Uses dynamic import to avoid loading pdfjs-dist at module level,
 * which would fail in jsdom test environments (no DOMMatrix).
 * Returns concatenated text from all pages.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist')

    // Configure the worker source (idempotent)
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString()
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pageTexts: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .filter((item): item is TextItem => 'str' in item)
        .map((item) => item.str)
        .join(' ')
      pageTexts.push(pageText)
    }

    return pageTexts.join('\n')
  } catch {
    return ''
  }
}
