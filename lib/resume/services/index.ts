/**
 * Resume Services Module
 */

export {
  extractResumeText,
  processResume,
  batchProcessResumes,
  type ProcessResumeResult,
  type ResumeRecord,
} from './ingestion'

export {
  extractResumeText as extractResumeTextFromBytes,
  parseAndPersistResumeById,
  uploadAndParseResume,
  type ParsedResumePayload,
} from './resume-scraper'
