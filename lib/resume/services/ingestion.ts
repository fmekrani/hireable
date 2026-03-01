/**
 * Resume Ingestion Service
 * 
 * Handles the complete workflow of downloading a resume from Supabase Storage,
 * extracting text content, and updating the database.
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  getExtractorByPath,
  ExtractionError,
  ExtractionOptions,
  ExtractionResult,
  DEFAULT_EXTRACTOR_CONFIG,
} from '../extractors'

export interface ProcessResumeResult {
  success: boolean
  resumeId: string
  textLength?: number
  pageCount?: number
  warnings?: string[]
  error?: string
  errorCode?: string
}

export interface ResumeRecord {
  id: string
  user_id: string
  file_name: string
  file_path: string
  raw_text?: string | null
  parsed_data?: unknown
  uploaded_at: string
}

const STORAGE_BUCKET = 'resumes'

/**
 * Extract raw text from a file URL (Supabase Storage path)
 * 
 * @param fileUrl - The storage path or public URL of the file
 * @param options - Extraction options
 * @returns Promise resolving to the extracted text
 */
export async function extractResumeText(
  fileUrl: string,
  options?: ExtractionOptions
): Promise<string> {
  console.log(`[ResumeIngestion] Starting text extraction for: ${fileUrl}`)

  // Determine if this is a storage path or full URL
  const storagePath = fileUrl.startsWith('http')
    ? extractStoragePathFromUrl(fileUrl)
    : fileUrl

  console.log(`[ResumeIngestion] Storage path: ${storagePath}`)

  // Download file from Supabase Storage
  const buffer = await downloadFile(storagePath)

  // Get appropriate extractor
  const extractor = getExtractorByPath(storagePath)
  console.log(`[ResumeIngestion] Using extractor for: ${storagePath}`)

  // Extract text
  const result = await extractor.extract(buffer, options)

  if (result.warnings?.length) {
    console.warn(`[ResumeIngestion] Extraction warnings:`, result.warnings)
  }

  return result.text
}

/**
 * Process a resume by ID: fetch, extract text, and update database
 * 
 * @param resumeId - UUID of the resume record
 * @returns Processing result with status and details
 */
export async function processResume(resumeId: string): Promise<ProcessResumeResult> {
  console.log(`[ResumeIngestion] Processing resume: ${resumeId}`)

  try {
    // 1. Fetch resume record from database
    const { data: resume, error: fetchError } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single()

    if (fetchError) {
      console.error(`[ResumeIngestion] Failed to fetch resume:`, fetchError)
      return {
        success: false,
        resumeId,
        error: `Failed to fetch resume: ${fetchError.message}`,
        errorCode: 'FETCH_ERROR',
      }
    }

    if (!resume) {
      return {
        success: false,
        resumeId,
        error: 'Resume not found',
        errorCode: 'NOT_FOUND',
      }
    }

    const resumeRecord = resume as ResumeRecord
    console.log(`[ResumeIngestion] Found resume: ${resumeRecord.file_name}`)

    // 2. Download and extract text
    const buffer = await downloadFile(resumeRecord.file_path)
    const extractor = getExtractorByPath(resumeRecord.file_name)

    const extractionResult = await extractor.extract(buffer)

    if (!extractionResult.text.trim()) {
      return {
        success: false,
        resumeId,
        error: 'No text could be extracted from the document',
        errorCode: 'EMPTY_CONTENT',
        warnings: extractionResult.warnings,
      }
    }

    // 3. Update the resume record with extracted text
    const { error: updateError } = await supabaseAdmin
      .from('resumes')
      .update({
        raw_text: extractionResult.text,
        // Optionally update parsed_data with metadata
        parsed_data: {
          ...((resumeRecord.parsed_data as object) || {}),
          extraction_metadata: {
            extracted_at: new Date().toISOString(),
            text_length: extractionResult.text.length,
            page_count: extractionResult.pageCount,
            warnings: extractionResult.warnings,
          },
        },
      })
      .eq('id', resumeId)

    if (updateError) {
      console.error(`[ResumeIngestion] Failed to update resume:`, updateError)
      return {
        success: false,
        resumeId,
        error: `Failed to save extracted text: ${updateError.message}`,
        errorCode: 'UPDATE_ERROR',
      }
    }

    console.log(`[ResumeIngestion] Successfully processed resume: ${resumeId}`)
    console.log(`[ResumeIngestion] Extracted ${extractionResult.text.length} characters`)

    return {
      success: true,
      resumeId,
      textLength: extractionResult.text.length,
      pageCount: extractionResult.pageCount,
      warnings: extractionResult.warnings,
    }
  } catch (error) {
    console.error(`[ResumeIngestion] Error processing resume:`, error)

    if (error instanceof ExtractionError) {
      return {
        success: false,
        resumeId,
        error: error.message,
        errorCode: error.code,
      }
    }

    return {
      success: false,
      resumeId,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'UNKNOWN_ERROR',
    }
  }
}

/**
 * Download a file from Supabase Storage
 */
async function downloadFile(storagePath: string): Promise<Buffer> {
  console.log(`[ResumeIngestion] Downloading file: ${storagePath}`)

  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .download(storagePath)

  if (error) {
    console.error(`[ResumeIngestion] Storage download failed:`, error)
    throw new ExtractionError(
      `Failed to download file: ${error.message}`,
      'DOWNLOAD_ERROR'
    )
  }

  if (!data) {
    throw new ExtractionError('Downloaded file is empty', 'EMPTY_CONTENT')
  }

  // Validate file size
  const maxSize = DEFAULT_EXTRACTOR_CONFIG.maxFileSize
  if (data.size > maxSize) {
    throw new ExtractionError(
      `File exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`,
      'FILE_TOO_LARGE'
    )
  }

  // Convert Blob to Buffer
  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Extract storage path from a Supabase public URL
 */
function extractStoragePathFromUrl(url: string): string {
  // Supabase public URLs follow pattern:
  // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/)
  if (match) {
    return decodeURIComponent(match[1])
  }

  // If not a standard Supabase URL, assume it's already a path
  return url
}

/**
 * Batch process multiple resumes
 * 
 * @param resumeIds - Array of resume IDs to process
 * @param concurrency - Number of concurrent extractions (default: 3)
 */
export async function batchProcessResumes(
  resumeIds: string[],
  concurrency = 3
): Promise<ProcessResumeResult[]> {
  console.log(`[ResumeIngestion] Batch processing ${resumeIds.length} resumes`)

  const results: ProcessResumeResult[] = []

  // Process in batches to avoid overwhelming resources
  for (let i = 0; i < resumeIds.length; i += concurrency) {
    const batch = resumeIds.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((id) => processResume(id))
    )
    results.push(...batchResults)

    const successful = batchResults.filter((r) => r.success).length
    console.log(`[ResumeIngestion] Batch ${Math.floor(i / concurrency) + 1}: ${successful}/${batch.length} successful`)
  }

  const totalSuccess = results.filter((r) => r.success).length
  console.log(`[ResumeIngestion] Batch complete: ${totalSuccess}/${resumeIds.length} successful`)

  return results
}
