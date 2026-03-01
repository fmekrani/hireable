import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { parseAndPersistResumeById } from '@/lib/resume/services/resume-scraper'

export const runtime = 'nodejs'

interface ProcessRequest {
  resumeId?: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let body: ProcessRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const resumeId = body.resumeId?.trim()
    if (!resumeId) {
      return NextResponse.json(
        { success: false, data: null, error: 'resumeId is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const result = await parseAndPersistResumeById({
      supabase,
      resumeId,
      userId: user.id,
    })

    return NextResponse.json({
      success: true,
      data: {
        resume_id: result.resumeId,
        file_name: result.fileName,
        skills: result.parsedJson.skills,
        tech_stack: result.parsedJson.techStack,
        parsed_at: result.parsedAt,
      },
      error: null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Resume Process API] Error:', message)
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Resume processing API is ready',
    note: 'Prefer /api/resume/parse for the canonical response shape.',
  })
}
