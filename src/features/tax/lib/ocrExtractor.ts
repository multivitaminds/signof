import { createWorker } from 'tesseract.js'

/**
 * Extract text from an image file using Tesseract.js OCR.
 * Supports PNG, JPG, and image-based PDFs.
 */
export async function extractTextFromImage(file: File): Promise<string> {
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null
  try {
    worker = await createWorker('eng')
    const result = await worker.recognize(file)
    return result.data.text
  } catch {
    return ''
  } finally {
    if (worker) {
      await worker.terminate()
    }
  }
}
