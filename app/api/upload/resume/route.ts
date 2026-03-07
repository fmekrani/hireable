import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { uploadAndParseResume } from '@/lib/resume/services/resume-scraper'

export const runtime = 'nodejs'

const MAX_SIZE = 10 * 1024 * 1024
const SUPPORTED_TYPES = new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'])
const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc']

function isSupportedFile(fileName: string, mimeType: string): boolean {
  const lower = fileName.toLowerCase()
  return SUPPORTED_TYPES.has(mimeType.toLowerCase()) || SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Resume upload API is ready',
    supportedTypes: ['pdf', 'docx', 'doc'],
    maxSizeBytes: MAX_SIZE,
  })
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unsupported Media Type' },
        { status: 415 }
      )
    }

    const form = await req.formData()
    const file = form.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing file' },
        { status: 400 }
      )
    }

    const fileName = file.name || 'resume.pdf'
    const fileType = (file.type || '').toLowerCase()

    if (!isSupportedFile(fileName, fileType)) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unsupported file type. Supported: PDF, DOCX, DOC' },
        { status: 415 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, data: null, error: `File too large (max ${Math.round(MAX_SIZE / 1024 / 1024)}MB)` },
        { status: 413 }
      )
    }

    const fileBytes = Buffer.from(await file.arrayBuffer())
    const supabase = await createServerSupabaseClient()
    const result = await uploadAndParseResume({
      supabase,
      userId: user.id,
      fileName,
      mimeType: fileType,
      fileBytes,
    })

    const responseData = {
      resume_id: result.resumeId,
      resume: {
        file_name: result.fileName,
        skills: result.parsedJson.skills,
        years_experience: result.parsedStructured?.yearsExperience ?? null,
        seniority: result.parsedStructured?.seniority ?? null,
        domain: result.parsedStructured?.domain ?? null,
      },
      resume_data: {
        file_name: result.fileName,
        rawText: result.parsedJson.rawText,
        skills: result.parsedJson.skills,
        tech_stack: result.parsedJson.techStack,
        metadata: result.parsedJson.metadata ?? {},
        structured: result.parsedStructured ?? null,
        parsed_at: result.parsedAt,
        source: 'resume_scrape_v2',
      },
      // Backward-compatible fields expected by interviewer flow.
      skills: result.parsedStructured?.skills ?? result.parsedJson.skills,
      yearsExperience: result.parsedStructured?.yearsExperience ?? 0,
      seniority: result.parsedStructured?.seniority ?? 'Entry',
      domain: result.parsedStructured?.domain,
      education: result.parsedStructured?.education,
      meta: result.parsedStructured?.meta,
    }

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        error: null,
        ...responseData,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Upload Resume] Error:', message)
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 }
    )
  }
}
