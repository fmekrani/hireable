/**
 * Health Check API
 * Simple endpoint to verify the backend is running
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: 'Backend is running',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
