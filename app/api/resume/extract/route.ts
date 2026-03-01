/**
 * Resume Text Extraction API
 * 
 * POST /api/resume/extract
 * Accept a file upload and extract raw text
 * 
 * Request: FormData with 'file' field
 * Response: { success: boolean, text: string, parsed: ParsedResume, ... }
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getExtractorByExtension,
  ExtractionError,
  DEFAULT_EXTRACTOR_CONFIG,
} from '@/lib/resume/extractors'
import { parseResume } from '@/lib/resume/parser'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('[Resume Extract API] Incoming request')

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`[Resume Extract API] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Validate file size
    const maxSize = DEFAULT_EXTRACTOR_CONFIG.maxFileSize
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
          errorCode: 'FILE_TOO_LARGE'
        },
        { status: 400 }
      )
    }

    // Get file extension
    const fileName = file.name
    const extension = fileName.split('.').pop()?.toLowerCase() || ''

    if (!['pdf', 'docx', 'doc'].includes(extension)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Unsupported file type: .${extension}. Supported: PDF, DOCX, DOC`,
          errorCode: 'UNSUPPORTED_TYPE'
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get appropriate extractor
    const extractor = getExtractorByExtension(extension)

    // Extract text
    console.log(`[Resume Extract API] Extracting text from ${extension.toUpperCase()}`)
    const result = await extractor.extract(buffer)

    if (!result.text.trim()) {
      return NextResponse.json({
        success: true,
        text: '',
        fileName: file.name,
        fileSize: file.size,
        pageCount: result.pageCount,
        warnings: result.warnings || ['No text could be extracted from the document'],
      })
    }

    console.log(`[Resume Extract API] Successfully extracted ${result.text.length} characters`)

    // Parse the text into structured sections
    console.log('[Resume Extract API] Parsing resume sections...')
    console.log('[Resume Extract] Raw text length:', result.text.length)
    console.log('[Resume Extract] First 500 chars:', result.text.substring(0, 500))
    let parsed
    try {
      parsed = parseResume(result.text)
      console.log(`[Resume Extract API] Parsed: ${parsed.experience.length} experience entries, ${parsed.education.length} education entries, ${parsed.skills.all.length} skills`)
      console.log('[Resume Extract] Full parsed resume:', JSON.stringify(parsed, null, 2))
    } catch (parseError) {
      console.error('[Resume Extract API] Parsing error:', parseError)
      if (parseError instanceof Error) {
        console.error('[Resume Extract API] Error message:', parseError.message)
        console.error('[Resume Extract API] Error stack:', parseError.stack)
      }
      // Continue without parsing if there's an error
      parsed = null
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      parsed,
      fileName: file.name,
      fileSize: file.size,
      pageCount: result.pageCount,
      metadata: result.metadata,
      warnings: result.warnings,
    })
  } catch (error) {
    console.error('[Resume Extract API] Error:', error)

    if (error instanceof ExtractionError) {
      return NextResponse.json(
        { success: false, error: error.message, errorCode: error.code },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Resume text extraction API is ready',
    supportedTypes: ['pdf', 'docx', 'doc'],
    maxFileSize: `${Math.round(DEFAULT_EXTRACTOR_CONFIG.maxFileSize / 1024 / 1024)}MB`,
  })
}
