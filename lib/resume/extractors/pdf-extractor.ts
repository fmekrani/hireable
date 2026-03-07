/**
 * PDF Document Extractor
 * 
 * Extracts raw text from PDF files using pdf-parse.
 */

import {
  DocumentExtractor,
  ExtractionResult,
  ExtractionOptions,
  ExtractionError,
  DEFAULT_EXTRACTOR_CONFIG,
} from './types'
import { normalizeText } from '../utils/text-normalizer'

export class PdfExtractor implements DocumentExtractor {
  readonly supportedMimeTypes = ['application/pdf']
  readonly supportedExtensions = ['.pdf', 'pdf']

  supportsMimeType(mimeType: string): boolean {
    return this.supportedMimeTypes.includes(mimeType.toLowerCase())
  }

  supportsExtension(extension: string): boolean {
    const ext = extension.toLowerCase().replace(/^\./, '')
    return this.supportedExtensions.includes(ext) || this.supportedExtensions.includes(`.${ext}`)
  }

  async extract(buffer: Buffer, options?: ExtractionOptions): Promise<ExtractionResult> {
    const maxFileSize = options?.maxFileSize ?? DEFAULT_EXTRACTOR_CONFIG.maxFileSize
    const shouldNormalize = options?.normalizeWhitespace ?? DEFAULT_EXTRACTOR_CONFIG.defaultNormalizeWhitespace

    // Validate file size
    if (buffer.length > maxFileSize) {
      throw new ExtractionError(
        `PDF file exceeds maximum size of ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        'FILE_TOO_LARGE'
      )
    }

    console.log(`[PdfExtractor] Extracting text from PDF (${buffer.length} bytes)`)

    try {
      // pdf-parse v1 - use require for better compatibility
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      
      const data = await pdfParse(buffer)

      let text = data.text || ''

      if (!text.trim()) {
        console.warn('[PdfExtractor] PDF extraction returned empty text')
        return {
          text: '',
          pageCount: data.numpages,
          metadata: {
            info: data.info,
            version: data.version,
          },
          warnings: ['PDF may be image-based or have no extractable text'],
        }
      }

      if (shouldNormalize) {
        text = normalizeText(text, { stripSpecialChars: options?.stripSpecialChars })
      }

      console.log(`[PdfExtractor] Successfully extracted ${text.length} characters from ${data.numpages} pages`)

      return {
        text,
        pageCount: data.numpages,
        metadata: {
          info: data.info,
          version: data.version,
        },
      }
    } catch (error) {
      console.error('[PdfExtractor] Failed to parse PDF:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new ExtractionError(
        `Failed to parse PDF document: ${errorMessage}`,
        'PARSE_ERROR',
        error instanceof Error ? error : undefined
      )
    }
  }
}
