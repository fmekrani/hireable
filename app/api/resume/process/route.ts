/**
 * Resume Processing API
 * 
 * POST /api/resume/process
 * Process a resume to extract raw text
 * 
 * Request: { resumeId: string }
 * Response: { success: boolean, ... }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processResume } from '@/lib/resume/services/ingestion'

export const runtime = 'nodejs'

interface ProcessRequest {
  resumeId?: string
}

export async function POST(request: NextRequest) {
  console.log('[Resume Process API] Incoming request')

  try {
    // Parse request body
    let body: ProcessRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { resumeId } = body

    if (!resumeId || typeof resumeId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'resumeId is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(resumeId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resumeId format' },
        { status: 400 }
      )
    }

    // Optional: Validate user authorization
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (token) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { authorization: `Bearer ${token}` },
        },
      })

      const { data: { user } } = await supabase.auth.getUser()

      if (!user && process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Process the resume
    console.log(`[Resume Process API] Processing resume: ${resumeId}`)
    const result = await processResume(resumeId)

    if (!result.success) {
      const statusCode = result.errorCode === 'NOT_FOUND' ? 404 : 500
      return NextResponse.json(result, { status: statusCode })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Resume Process API] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        errorCode: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Resume processing API is ready',
    supportedTypes: ['pdf', 'docx', 'doc'],
  })
}
