/**
 * Save User Analysis to Supabase
 * POST /api/analysis/save
 * Stores analysis data with user ID for persistence
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { company, position, score, url, jobData } = await request.json()

    // Get user from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user session
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate user' },
        { status: 401 }
      )
    }

    // Save analysis to database
    const { data, error } = await supabase
      .from('user_analyses')
      .insert({
        user_id: user.id,
        company_name: company,
        position_title: position,
        match_score: score,
        job_url: url,
        job_data: jobData,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('[Analysis Save API] Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: 'Analysis saved successfully',
    })
  } catch (error) {
    console.error('[Analysis Save API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
