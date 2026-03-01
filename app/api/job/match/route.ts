/**
 * Job-Resume Skill Matching API
 *
 * Integration point between resume parsing and job scraping.
 * Uses the same skill canonicalization as both systems.
 *
 * Repo alignment:
 * - Shared skill normalization: /lib/skills/canonicalSkills.ts
 *   - normalizeSkillsFromText() - used by both resume & job scrapers
 *   - getSkillOverlap() - matches resume against job requirements
 *   - getSkillOverlapSummary() - summary format for responses
 * - Resume storage: public.resumes table via Supabase
 * - Job data: typically from /api/scrape/jobs or user-provided
 *
 * POST /api/job/match
 * Request: { resume_skills: string[], job_skills: string[] }
 *   OR:    { resume_id: uuid, job_skills: string[] }
 * Response: { success, matched, missing, score, details }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSkillOverlapSummary } from '@/lib/skills/canonicalSkills'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'

export const runtime = 'nodejs'

interface MatchRequest {
  resume_skills?: string[]
  resume_id?: string
  job_skills: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MatchRequest

    if (!body.job_skills || !Array.isArray(body.job_skills) || body.job_skills.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'job_skills array is required and must not be empty',
        },
        { status: 400 }
      )
    }

    let resumeSkills: string[] = []

    // Option 1: Direct skills array in request
    if (body.resume_skills && Array.isArray(body.resume_skills)) {
      resumeSkills = body.resume_skills
    }
    // Option 2: Fetch from stored resume by ID
    else if (body.resume_id) {
      const user = await getServerUser()
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized - resume_id requires authentication',
          },
          { status: 401 }
        )
      }

      const supabase = await createServerSupabaseClient()
      const { data: resume, error: fetchError } = await supabase
        .from('resumes')
        .select('id, user_id, parsed_data')
        .eq('id', body.resume_id)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !resume) {
        return NextResponse.json(
          {
            success: false,
            error: 'Resume not found or access denied',
          },
          { status: 404 }
        )
      }

      const parsedData = resume.parsed_data as { skills?: string[] } | null
      if (parsedData?.skills) {
        resumeSkills = parsedData.skills
      }
    }

    if (resumeSkills.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'resume_skills or resume_id required - no skills found',
        },
        { status: 400 }
      )
    }

    // Calculate overlap
    const matchSummary = getSkillOverlapSummary(resumeSkills, body.job_skills)

    console.log(`[Job Match] Matched ${matchSummary.matchedSkills.length}/${body.job_skills.length} skills`)

    return NextResponse.json(
      {
        success: true,
        resume_skills_count: resumeSkills.length,
        job_skills_count: body.job_skills.length,
        matched_skills: matchSummary.matchedSkills,
        missing_skills: matchSummary.missingSkills,
        match_percentage: matchSummary.score,
        details: {
          matched_count: matchSummary.matchedSkills.length,
          missing_count: matchSummary.missingSkills.length,
          total_job_skills: body.job_skills.length,
          match_score: `${matchSummary.score}%`,
          ready_to_apply: matchSummary.score >= 60,
          learning_priority: matchSummary.missingSkills.slice(0, 3),
        },
        error: null,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Job Match] Error:', message)
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Job-Resume skill matching API',
    usage: {
      method: 'POST',
      body: {
        option1: {
          description: 'Direct skill arrays',
          example: {
            resume_skills: ['Python', 'SQL', 'Docker'],
            job_skills: ['Python', 'Docker', 'Kubernetes'],
          },
        },
        option2: {
          description: 'Resume from database + job skills',
          example: {
            resume_id: 'uuid-here',
            job_skills: ['Python', 'Docker', 'Kubernetes'],
          },
        },
      },
      response: {
        success: true,
        matched_skills: ['Python', 'Docker'],
        missing_skills: ['Kubernetes'],
        match_percentage: 67,
      },
    },
  })
}
