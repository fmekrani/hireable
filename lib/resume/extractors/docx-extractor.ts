/**
 * DOCX Document Extractor
 * 
 * Extracts raw text from DOCX files using mammoth.
 */

import {
  DocumentExtractor,
  ExtractionResult,
  ExtractionOptions,
  ExtractionError,
  DEFAULT_EXTRACTOR_CONFIG,
} from './types'
import { normalizeText } from '../utils/text-normalizer'

export class DocxExtractor implements DocumentExtractor {
  readonly supportedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]
  readonly supportedExtensions = ['.docx', '.doc', 'docx', 'doc']

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
        `DOCX file exceeds maximum size of ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        'FILE_TOO_LARGE'
      )
    }

    console.log(`[DocxExtractor] Extracting text from DOCX (${buffer.length} bytes)`)

    try {
      // Dynamic import to avoid webpack bundling issues
      const mammoth = (await import('mammoth')).default

      const result = await mammoth.extractRawText({ buffer })
      let text = result.value || ''
      const warnings: string[] = []

      // Collect mammoth warnings
      if (result.messages && result.messages.length > 0) {
        result.messages.forEach((msg: { message: string }) => {
          console.warn(`[DocxExtractor] Mammoth warning: ${msg.message}`)
          warnings.push(msg.message)
        })
      }

      if (!text.trim()) {
        console.warn('[DocxExtractor] DOCX extraction returned empty text')
        return {
          text: '',
          warnings: ['Document appears to be empty or has no extractable text'],
        }
      }

      if (shouldNormalize) {
        text = normalizeText(text, { stripSpecialChars: options?.stripSpecialChars })
      }

      console.log(`[DocxExtractor] Successfully extracted ${text.length} characters`)

      return {
        text,
        warnings: warnings.length > 0 ? warnings : undefined,
      }
    } catch (error) {
      console.error('[DocxExtractor] Failed to parse DOCX:', error)
      throw new ExtractionError(
        'Failed to parse DOCX document',
        'PARSE_ERROR',
        error instanceof Error ? error : undefined
      )
    }
  }
}
