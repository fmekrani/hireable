/**
 * Resume Parse API
 *
 * Discovery summary (repo alignment):
 * - Job scraper endpoint: /app/api/job/scrape/route.ts -> POST(request: NextRequest)
 * - Job skills extraction: /lib/scraper/extractSkills.ts -> extractSkills()
 * - Shared canonical skill map: /lib/skills/canonicalSkills.ts -> normalizeSkillsFromText()
 * - Supabase server client: /lib/supabase/server.ts -> createServerSupabaseClient(), getServerUser()
 * - Storage + DB tables: bucket "resumes", table public.resumes from /supabase/migrations/001_init_schema.sql
 * - Job scraper response shape: { success, job, job_data } from /app/api/job/scrape/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { parseAndPersistResumeById } from '@/lib/resume/services/resume-scraper'

export const runtime = 'nodejs'

interface ParseBody {
  resume_id?: string
}

function toResponse(result: {
  resumeId: string
  fileName: string
  parsedAt: string
  parsedJson: {
    rawText: string
    skills: string[]
    techStack: string[]
    metadata?: Record<string, unknown>
    structured?: any
  }
}) {
  return {
    success: true,
    resume_id: result.resumeId,
    resume: {
      file_name: result.fileName,
      skills: result.parsedJson.skills,
      years_experience: result.parsedJson.structured?.yearsExperience ?? null,
      seniority: result.parsedJson.structured?.seniority ?? null,
      domain: result.parsedJson.structured?.domain ?? null,
    },
    resume_data: {
      file_name: result.fileName,
      rawText: result.parsedJson.rawText,
      skills: result.parsedJson.skills,
      tech_stack: result.parsedJson.techStack,
      metadata: result.parsedJson.metadata ?? {},
      structured: result.parsedJson.structured ?? null,
      parsed_at: result.parsedAt,
      source: 'resume_scrape_v2',
    },
    error: null,
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: ParseBody
    try {
      body = (await request.json()) as ParseBody
    } catch {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const resumeId = body.resume_id?.trim()
    if (!resumeId) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing resume_id parameter' },
        { status: 400 }
      )
    }

    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const result = await parseAndPersistResumeById({
      supabase,
      resumeId,
      userId: user.id,
    })

    const data = toResponse(result)
    return NextResponse.json({
      success: true,
      data,
      error: null,
      resume_id: data.resume_id,
      resume: data.resume,
      resume_data: data.resume_data,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Resume Parse] Error:', message)
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Resume parse API is ready',
  })
}
