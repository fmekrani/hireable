/**
 * Save User Analysis to Supabase
 * POST /api/analysis/save
 * Stores analysis data with user ID for persistence
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Create Supabase client with auth token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Analysis Save API] Missing Supabase credentials')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          authorization: authHeader,
        },
      },
    })

    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[Analysis Save API] Auth error:', userError)
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
        { 
          success: false, 
          error: error.message || 'Failed to save analysis to database',
          details: error
        },
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
