/**
 * Extractor Factory
 * 
 * Factory for selecting the appropriate document extractor based on
 * MIME type or file extension. Easily extensible for new file types.
 */

import { DocumentExtractor, ExtractionError, ExtractorType } from './types'
import { PdfExtractor } from './pdf-extractor'
import { DocxExtractor } from './docx-extractor'

// Registry of available extractors
const extractorRegistry: Map<ExtractorType, DocumentExtractor> = new Map()

// Initialize default extractors
const pdfExtractor = new PdfExtractor()
const docxExtractor = new DocxExtractor()

extractorRegistry.set('pdf', pdfExtractor)
extractorRegistry.set('docx', docxExtractor)
extractorRegistry.set('doc', docxExtractor) // Use mammoth for .doc as well

/**
 * Get the appropriate extractor for a MIME type
 */
export function getExtractorByMimeType(mimeType: string): DocumentExtractor {
  const normalizedMime = mimeType.toLowerCase().trim()

  for (const extractor of extractorRegistry.values()) {
    if (extractor.supportsMimeType(normalizedMime)) {
      return extractor
    }
  }

  throw new ExtractionError(
    `No extractor available for MIME type: ${mimeType}`,
    'UNSUPPORTED_TYPE'
  )
}

/**
 * Get the appropriate extractor for a file extension
 */
export function getExtractorByExtension(extension: string): DocumentExtractor {
  const normalizedExt = extension.toLowerCase().replace(/^\./, '')

  for (const extractor of extractorRegistry.values()) {
    if (extractor.supportsExtension(normalizedExt)) {
      return extractor
    }
  }

  throw new ExtractionError(
    `No extractor available for file extension: ${extension}`,
    'UNSUPPORTED_TYPE'
  )
}

/**
 * Get extractor by file path (extracts extension from path)
 */
export function getExtractorByPath(filePath: string): DocumentExtractor {
  const extension = filePath.split('.').pop() || ''
  return getExtractorByExtension(extension)
}

/**
 * Detect MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, '')

  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    txt: 'text/plain',
  }

  return mimeMap[ext] || 'application/octet-stream'
}

/**
 * Register a new extractor type
 * Allows extension of the extraction system
 */
export function registerExtractor(type: ExtractorType, extractor: DocumentExtractor): void {
  extractorRegistry.set(type, extractor)
  console.log(`[ExtractorFactory] Registered extractor for type: ${type}`)
}

/**
 * Get all supported MIME types
 */
export function getSupportedMimeTypes(): string[] {
  const mimeTypes: string[] = []
  for (const extractor of extractorRegistry.values()) {
    mimeTypes.push(...extractor.supportedMimeTypes)
  }
  return [...new Set(mimeTypes)]
}

/**
 * Get all supported file extensions
 */
export function getSupportedExtensions(): string[] {
  const extensions: string[] = []
  for (const extractor of extractorRegistry.values()) {
    extensions.push(...extractor.supportedExtensions)
  }
  return [...new Set(extensions)]
}

/**
 * Check if a file type is supported
 */
export function isSupported(mimeTypeOrExtension: string): boolean {
  try {
    getExtractorByMimeType(mimeTypeOrExtension)
    return true
  } catch {
    try {
      getExtractorByExtension(mimeTypeOrExtension)
      return true
    } catch {
      return false
    }
  }
}
