/**
 * Text Normalization Utilities
 * 
 * Cleans up extracted text from documents by normalizing whitespace,
 * removing artifacts, and standardizing line breaks.
 */

export interface NormalizeOptions {
  /** Remove special/control characters (default: false) */
  stripSpecialChars?: boolean
  /** Collapse multiple spaces to single space (default: true) */
  collapseSpaces?: boolean
  /** Normalize line endings to \n (default: true) */
  normalizeLineEndings?: boolean
  /** Remove excessive blank lines (default: true) */
  removeExcessiveBlankLines?: boolean
  /** Trim leading/trailing whitespace from each line (default: true) */
  trimLines?: boolean
}

const DEFAULT_OPTIONS: Required<NormalizeOptions> = {
  stripSpecialChars: false,
  collapseSpaces: true,
  normalizeLineEndings: true,
  removeExcessiveBlankLines: true,
  trimLines: true,
}

/**
 * Normalize extracted text by cleaning up whitespace and formatting artifacts
 */
export function normalizeText(text: string, options?: NormalizeOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let result = text

  // Normalize line endings to \n
  if (opts.normalizeLineEndings) {
    result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  }

  // Remove control characters except newlines and tabs
  if (opts.stripSpecialChars) {
    // Remove control chars (0x00-0x1F) except tab (0x09), newline (0x0A), carriage return (0x0D)
    result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove common PDF artifacts
    result = result.replace(/[\uFFFD\uFEFF]/g, '')
  }

  // Collapse multiple spaces to single space (but preserve newlines)
  if (opts.collapseSpaces) {
    result = result.replace(/[^\S\n]+/g, ' ')
  }

  // Trim each line
  if (opts.trimLines) {
    result = result
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
  }

  // Remove excessive blank lines (more than 2 consecutive)
  if (opts.removeExcessiveBlankLines) {
    result = result.replace(/\n{3,}/g, '\n\n')
  }

  // Final trim
  result = result.trim()

  return result
}

/**
 * Extract clean sentences from text
 * Useful for AI processing later
 */
export function extractSentences(text: string): string[] {
  // Split on sentence boundaries
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  return sentences
}

/**
 * Remove common resume section headers for clean text extraction
 */
export function stripSectionHeaders(text: string): string {
  const sectionHeaders = [
    /^(experience|work experience|employment|professional experience)\s*:?\s*$/gim,
    /^(education|academic background|qualifications)\s*:?\s*$/gim,
    /^(skills|technical skills|core competencies)\s*:?\s*$/gim,
    /^(summary|professional summary|objective|profile)\s*:?\s*$/gim,
    /^(certifications|certificates|licenses)\s*:?\s*$/gim,
    /^(projects|personal projects|side projects)\s*:?\s*$/gim,
    /^(awards|honors|achievements)\s*:?\s*$/gim,
    /^(references|references available)\s*:?\s*$/gim,
  ]

  let result = text
  for (const pattern of sectionHeaders) {
    result = result.replace(pattern, '\n')
  }

  return normalizeText(result)
}
