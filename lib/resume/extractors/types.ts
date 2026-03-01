/**
 * Document Extractor Types
 * 
 * Interfaces for the modular document extraction pipeline.
 * Designed for extensibility to support additional file types.
 */

export interface ExtractionResult {
  /** The extracted raw text content */
  text: string
  /** Number of pages (if applicable) */
  pageCount?: number
  /** File metadata */
  metadata?: Record<string, unknown>
  /** Extraction warnings (non-fatal issues) */
  warnings?: string[]
}

export interface ExtractionOptions {
  /** Maximum file size in bytes (default: 10MB) */
  maxFileSize?: number
  /** Whether to normalize whitespace (default: true) */
  normalizeWhitespace?: boolean
  /** Whether to remove special characters (default: false) */
  stripSpecialChars?: boolean
}

export interface DocumentExtractor {
  /** Supported MIME types */
  readonly supportedMimeTypes: string[]
  
  /** Supported file extensions */
  readonly supportedExtensions: string[]
  
  /**
   * Extract text content from a file buffer
   * @param buffer - The file content as a Buffer
   * @param options - Extraction options
   * @returns Promise resolving to extraction result
   */
  extract(buffer: Buffer, options?: ExtractionOptions): Promise<ExtractionResult>
  
  /**
   * Check if this extractor supports the given MIME type
   */
  supportsMimeType(mimeType: string): boolean
  
  /**
   * Check if this extractor supports the given file extension
   */
  supportsExtension(extension: string): boolean
}

export type ExtractorType = 'pdf' | 'docx' | 'doc' | 'txt'

export interface ExtractorConfig {
  maxFileSize: number
  defaultNormalizeWhitespace: boolean
}

export const DEFAULT_EXTRACTOR_CONFIG: ExtractorConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  defaultNormalizeWhitespace: true,
}

export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly code: ExtractionErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'ExtractionError'
  }
}

export type ExtractionErrorCode =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_TYPE'
  | 'PARSE_ERROR'
  | 'EMPTY_CONTENT'
  | 'DOWNLOAD_ERROR'
  | 'UNKNOWN_ERROR'
