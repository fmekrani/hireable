/**
 * Save User Analysis to Supabase
 * POST /api/analysis/save
 * Stores analysis data with user ID for persistence
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySupabaseToken } from '@/lib/supabase/verify-token'

export async function POST(request: NextRequest) {
  try {
    const { company, position, score, url, jobData, analysisResults } = await request.json()

    // Get user from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.error('[Analysis Save API] No authorization header')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.error('[Analysis Save API] Invalid authorization header format')
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
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

    // Verify the token and get user
    const user = await verifySupabaseToken(token)

    if (!user) {
      console.error('[Analysis Save API] Failed to verify token')
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate user' },
        { status: 401 }
      )
    }

    // Create Supabase client for database operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Package the complete analysis data into jobData
    const completeJobData = {
      ...jobData,
      analysisResults: analysisResults || null,
    }

    // Save analysis to database
    const insertData: any = {
      user_id: user.id,
      company_name: company,
      position_title: position,
      match_score: score,
      job_url: url,
      job_data: completeJobData,
      created_at: new Date().toISOString(),
    }
    // Note: analysis_results column will be used once migration 004 is applied

    const { data, error } = await supabase
      .from('user_analyses')
      .insert(insertData)
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
