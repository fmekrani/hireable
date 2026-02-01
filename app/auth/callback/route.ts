import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  console.log('[Auth Callback] Received request with code:', !!code, 'error:', error)

  // Handle OAuth errors
  if (error) {
    console.log('[Auth Callback] OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/?auth=error&message=${encodeURIComponent(error)}`, request.url)
    )
  }

  // Handle successful OAuth code exchange
  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      
      console.log('[Auth Callback] Exchanging code for session...')
      // Exchange the code for a session
      const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('[Auth Callback] Exchange result - error:', exchangeError?.message, 'session:', !!data?.session)
      
      if (exchangeError) {
        console.log('[Auth Callback] Exchange error:', exchangeError.message)
        return NextResponse.redirect(
          new URL(`/?auth=error&message=${encodeURIComponent(exchangeError.message)}`, request.url)
        )
      }
      
      // Session has been established, redirect with success indicator
      console.log('[Auth Callback] Session established, redirecting to home with success')
      return NextResponse.redirect(new URL('/?auth=success', request.url))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      console.log('[Auth Callback] Exception:', errorMessage)
      return NextResponse.redirect(
        new URL(`/?auth=error&message=${encodeURIComponent(errorMessage)}`, request.url)
      )
    }
  }

  console.log('[Auth Callback] No code or error, redirecting to home')
  return NextResponse.redirect(new URL('/', request.url))
}
