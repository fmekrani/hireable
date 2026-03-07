/**
 * Delete User Analysis from Supabase
 * DELETE /api/analysis/delete
 * Deletes a saved analysis for the logged-in user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySupabaseToken } from '@/lib/supabase/verify-token'

export async function DELETE(request: NextRequest) {
  try {
    const { analysisId } = await request.json()

    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'Analysis ID required' },
        { status: 400 }
      )
    }

    // Get user from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.error('[Analysis Delete API] No authorization header')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.error('[Analysis Delete API] Invalid authorization header format')
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 401 }
      )
    }

    // Create Supabase client with auth token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Analysis Delete API] Missing Supabase credentials')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify the token and get user
    const user = await verifySupabaseToken(token)

    if (!user) {
      console.error('[Analysis Delete API] Failed to verify token')
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate user' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Delete analysis from database
    const { error } = await supabase
      .from('user_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[Analysis Delete API] Database error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Failed to delete analysis',
          details: error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully',
    })
  } catch (error) {
    console.error('[Analysis Delete API] Error:', error)
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
