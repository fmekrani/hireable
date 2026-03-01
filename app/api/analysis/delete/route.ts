/**
 * Delete User Analysis from Supabase
 * DELETE /api/analysis/delete
 * Deletes a saved analysis for the logged-in user
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

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

    // Delete analysis from database
    const { error } = await supabase
      .from('user_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[Analysis Delete API] Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete analysis' },
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
