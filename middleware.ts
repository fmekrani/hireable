import { NextRequest, NextResponse } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/history', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get all cookies to check for Supabase auth tokens
  const cookieHeader = request.headers.get('cookie') || ''
  
  // Supabase uses multiple possible cookie names depending on configuration
  // Check for auth tokens in cookies
  const hasAuthToken = 
    request.cookies.has('sb-auth-token') ||
    request.cookies.has('sb-access-token') ||
    cookieHeader.includes('sb-') ||
    // Also check for the session cookie directly
    request.cookies.has('auth') ||
    // Fallback: inspect raw cookie header for any cookie names/values containing 'sb' or 'auth'
    cookieHeader
      .split(';')
      .map(c => c.trim())
      .filter(Boolean)
      .some((cookie: string) => cookie.startsWith('sb') || cookie.includes('auth'))

  if (!hasAuthToken) {
    // Redirect to root landing page if no auth token found
    console.log('[Middleware] No auth token found, redirecting to home:', pathname)
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/history/:path*', '/settings/:path*'],
}
