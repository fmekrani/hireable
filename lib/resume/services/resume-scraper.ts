import { normalizeSkillsFromText, filterTechStack } from '@/lib/skills/canonicalSkills'
import { parseResumeFromExtraction } from '@/lib/resume/parse'
import {
  getExtractorByExtension,
  getExtractorByMimeType,
  type ExtractionResult,
} from '@/lib/resume/extractors'

const STORAGE_BUCKET = 'resumes'

export interface ParsedResumePayload {
  rawText: string
  skills: string[]
  techStack: string[]
  pages?: number
  fileType: string
  wordCount: number
  warnings: string[]
  structured: ReturnType<typeof parseResumeFromExtraction> | null
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function resolveFileType(fileName: string, mimeType?: string): string {
  if (mimeType && mimeType.includes('/')) return mimeType.toLowerCase()
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? `.${extension}` : '.pdf'
}

function getExtractor(fileType: string) {
  const normalized = fileType.toLowerCase().trim()
  if (normalized.includes('/')) {
    return getExtractorByMimeType(normalized)
  }
  return getExtractorByExtension(normalized.replace(/^\./, ''))
}

function toParsedPayload(
  extraction: ExtractionResult,
  fileType: string
): ParsedResumePayload {
  const rawText = extraction.text || ''
  const skills = normalizeSkillsFromText(rawText)
  const techStack = filterTechStack(skills)
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0

  let structured: ReturnType<typeof parseResumeFromExtraction> | null = null
  try {
    structured = parseResumeFromExtraction({
      rawText,
      pages: [],
      error: null,
    })
  } catch (error) {
    console.warn('[Resume Scraper] Structured parse failed:', error)
  }

  return {
    rawText,
    skills,
    techStack,
    pages: extraction.pageCount,
    fileType,
    wordCount,
    warnings: extraction.warnings ?? [],
    structured,
  }
}

export async function extractResumeText(
  fileBytes: Buffer,
  fileType: string
): Promise<ParsedResumePayload> {
  const extractor = getExtractor(fileType)
  const extraction = await extractor.extract(fileBytes)
  return toParsedPayload(extraction, fileType)
}

export async function parseAndPersistResumeById(params: {
  supabase: any
  resumeId: string
  userId: string
}) {
  const { supabase, resumeId, userId } = params

  const { data: resume, error: fetchError } = await supabase
    .from('resumes')
    .select('id, user_id, file_name, file_path')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !resume) {
    throw new Error('Resume not found or access denied')
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(resume.file_path)

  if (downloadError || !fileData) {
    throw new Error(`Failed to download resume: ${downloadError?.message || 'Unknown error'}`)
  }

  const fileType = resolveFileType(resume.file_name)
  const parsed = await extractResumeText(Buffer.from(await fileData.arrayBuffer()), fileType)
  const parsedAt = new Date().toISOString()

  const parsedJson = {
    rawText: parsed.rawText,
    skills: parsed.skills,
    techStack: parsed.techStack,
    metadata: {
      pages: parsed.pages,
      fileType: parsed.fileType,
      wordCount: parsed.wordCount,
      warnings: parsed.warnings,
      extractedAt: parsedAt,
      source: 'resume_scrape_v2',
    },
    structured: parsed.structured,
  }

  const { error: updateError } = await supabase
    .from('resumes')
    .update({
      raw_text: parsed.rawText,
      parsed_data: parsedJson,
      parsed_at: parsedAt,
    })
    .eq('id', resumeId)
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Failed to store parsed data: ${updateError.message}`)
  }

  return {
    resumeId,
    fileName: resume.file_name,
    parsedAt,
    parsedJson,
    parsedStructured: parsed.structured,
  }
}

export async function uploadAndParseResume(params: {
  supabase: any
  userId: string
  fileName: string
  mimeType?: string
  fileBytes: Buffer
}) {
  const { supabase, userId, fileName, mimeType, fileBytes } = params
  const fileType = resolveFileType(fileName, mimeType)
  const storagePath = `${userId}/${Date.now()}-${sanitizeFileName(fileName)}`

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBytes, {
      contentType: mimeType || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Failed to upload resume: ${uploadError.message}`)
  }

  const { data: inserted, error: insertError } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      file_name: fileName,
      file_path: storagePath,
    })
    .select('id, file_name')
    .single()

  if (insertError || !inserted) {
    throw new Error(`Failed to create resume record: ${insertError?.message || 'Unknown error'}`)
  }

  const parsed = await extractResumeText(fileBytes, fileType)
  const parsedAt = new Date().toISOString()
  const parsedJson = {
    rawText: parsed.rawText,
    skills: parsed.skills,
    techStack: parsed.techStack,
    metadata: {
      pages: parsed.pages,
      fileType: parsed.fileType,
      wordCount: parsed.wordCount,
      warnings: parsed.warnings,
      extractedAt: parsedAt,
      source: 'resume_scrape_v2',
    },
    structured: parsed.structured,
  }

  const { error: updateError } = await supabase
    .from('resumes')
    .update({
      raw_text: parsed.rawText,
      parsed_data: parsedJson,
      parsed_at: parsedAt,
    })
    .eq('id', inserted.id)
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Failed to store parsed data: ${updateError.message}`)
  }

  return {
    resumeId: inserted.id,
    fileName: inserted.file_name,
    parsedAt,
    parsedJson,
    parsedStructured: parsed.structured,
  }
}
