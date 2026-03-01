/**
 * Resume Parse and Skills Normalization API
 * 
 * Endpoint: POST /api/resume/parse
 * 
 * Accepts a resume_id, extracts text from the already-uploaded resume file,
 * normalizes skills to canonical format (same as job web scraper),
 * stores both raw text and parsed data in database, and returns structured result.
 * 
 * Job Scraper integration patterns used:
 * - Supabase client from /lib/supabase/server.ts
 * - Skill normalization from /lib/skills/canonicalSkills.ts
 * - Database schema: public.resumes (raw_text, parsed_data, parsed_at)
 * - Response shape matches /api/job/scrape/route.ts success format
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { parseResumeFromExtraction } from '@/lib/resume/parse'
import { normalizeSkillsFromText, filterTechStack } from '@/lib/skills/canonicalSkills'
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

/**
 * Parse resume from uploaded file
 * - Extracts raw text
 * - Normalizes skills using job-scraper-compatible logic
 * - Stores in database
 * - Returns parsed result with skills in canonical format
 */
export async function POST(request: NextRequest) {
  let tmpPath: string | null = null

  try {
    const body = await request.json()
    const resumeId = body?.resume_id?.trim()

    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Missing resume_id parameter' },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // Get resume record to ensure user owns it
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('id, user_id, file_name, file_path, raw_text, parsed_data')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !resume) {
      return NextResponse.json(
        { success: false, error: 'Resume not found or access denied' },
        { status: 404 }
      )
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes') // Assumes bucket named 'resumes' exists
      .download(resume.file_path)

    if (downloadError || !fileData) {
      return NextResponse.json(
        { success: false, error: `Failed to download resume: ${downloadError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Save to temp file for extraction
    tmpPath = path.join(os.tmpdir(), `resume-parse-${resumeId}.pdf`)
    await fs.writeFile(tmpPath, Buffer.from(await fileData.arrayBuffer()))

    // Extract text using Python script (same as upload endpoint)
    const extraction = await runPythonExtractor(tmpPath)

    if (extraction.error) {
      return NextResponse.json(
        { success: false, error: `Extraction failed: ${extraction.error}` },
        { status: 500 }
      )
    }

    // Parse resume using existing parser
    let resumeParsed
    try {
      resumeParsed = parseResumeFromExtraction(extraction)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return NextResponse.json(
        { success: false, error: `Parse failed: ${msg}` },
        { status: 500 }
      )
    }

    // Normalize skills to canonical format
    // Use skills from parser, but also search raw text for additional matches
    const rawText = extraction.rawText || ''
    const normalizedSkills = normalizeSkillsFromText(rawText)
    const techStack = filterTechStack(normalizedSkills)

    // Store in database
    const parsedDataDb = {
      ...resumeParsed,
      raw_text_length: rawText.length,
      extracted_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        raw_text: rawText,
        parsed_data: parsedDataDb,
        parsed_at: new Date().toISOString(),
      })
      .eq('id', resumeId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: `Failed to store parsed data: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Return structured response matching job scraper format
    return NextResponse.json({
      success: true,
      resume_id: resumeId,
      resume: {
        file_name: resume.file_name,
        skills: normalizedSkills,
        years_experience: resumeParsed.yearsExperience,
        seniority: resumeParsed.seniority,
        domain: resumeParsed.domain,
      },
      resume_data: {
        file_name: resume.file_name,
        raw_text_length: rawText.length,
        raw_text_preview: rawText.substring(0, 500), // First 500 chars
        skills: normalizedSkills,
        tech_stack: techStack,
        years_experience: resumeParsed.yearsExperience,
        seniority: resumeParsed.seniority,
        domain: resumeParsed.domain,
        education: resumeParsed.education,
        meta: resumeParsed.meta,
        parsed_at: new Date().toISOString(),
        source: 'resume_parse_v1',
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: `Unexpected error: ${msg}` },
      { status: 500 }
    )
  } finally {
    // Clean up temp file
    if (tmpPath) {
      try {
        await fs.unlink(tmpPath).catch(() => {})
      } catch {}
    }
  }
}

/**
 * Wrapper around Python text extractor
 * Uses same pattern as /app/api/upload/resume/route.ts
 */
async function runPythonExtractor(tmpPath: string): Promise<{
  rawText: string
  pages: string[]
  error?: string | null
}> {
  return await new Promise((resolve) => {
    execFile(
      'python3',
      [path.join(process.cwd(), 'scripts', 'pdf_parser.py'), tmpPath],
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        let payload: { rawText: string; pages: string[]; error?: string | null } = {
          rawText: '',
          pages: [],
          error: null,
        }
        try {
          if (stdout) {
            payload = JSON.parse(stdout.toString())
          } else if (stderr) {
            payload = { rawText: '', pages: [], error: stderr.toString() }
          }
        } catch (e) {
          payload = { rawText: '', pages: [], error: `JSON parse error: ${(e as Error).message}` }
        }
        if (error) {
          const baseErr = error.message || String(error)
          payload.error = payload.error ? `${payload.error}; ${baseErr}` : baseErr
        }
        resolve(payload)
      }
    )
  })
}
