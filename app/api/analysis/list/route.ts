/**
 * Get User Analyses from Supabase
 * GET /api/analysis/list
 * Retrieves all saved analyses for the logged-in user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
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
      console.error('[Analysis List API] Missing Supabase credentials')
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
      console.error('[Analysis List API] Auth error:', userError)
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate user' },
        { status: 401 }
      )
    }

    // Get analyses from database
    const { data, error } = await supabase
      .from('user_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Analysis List API] Database error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Failed to fetch analyses',
          details: error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('[Analysis List API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
