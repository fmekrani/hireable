import { NextRequest, NextResponse } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/analysis', '/calendar', '/history', '/settings']

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
    // Check if any cookie starting with 'sb' exists (Supabase session)
    Array.from(request.cookies.getSetCookie()).some((cookie: string) => cookie.includes('auth'))

  if (!hasAuthToken) {
    // Redirect to login if no auth token found
    console.log('[Middleware] No auth token found, redirecting to login:', pathname)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Allow request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/analysis/:path*', '/calendar/:path*', '/history/:path*', '/settings/:path*'],
}
