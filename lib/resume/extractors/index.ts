/**
 * Document Extractor Module
 * 
 * Barrel export for the document extraction system.
 */

// Types - use 'export type' for interfaces and type aliases
export type {
  DocumentExtractor,
  ExtractionResult,
  ExtractionOptions,
  ExtractionErrorCode,
  ExtractorType,
  ExtractorConfig,
} from './types'

// Values - classes and constants
export {
  ExtractionError,
  DEFAULT_EXTRACTOR_CONFIG,
} from './types'

// Extractors
export { PdfExtractor } from './pdf-extractor'
export { DocxExtractor } from './docx-extractor'

// Factory
export {
  getExtractorByMimeType,
  getExtractorByExtension,
  getExtractorByPath,
  getMimeTypeFromExtension,
  registerExtractor,
  getSupportedMimeTypes,
  getSupportedExtensions,
  isSupported,
} from './factory'
