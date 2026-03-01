'use client'

import { useEffect } from 'react'

// List of known non-critical error messages to suppress
const suppressedPatterns = [
  'signal is aborted',
  'Failed to fetch',
  'AbortError',
  'NetworkError',
  'Load failed',
  'fetch failed',
  'TypeError: Failed',
  'Network error',
  'net::ERR_',
  'WebSocket',
  'ECONNREFUSED',
]

const shouldSuppress = (error: any): boolean => {
  if (!error) return false
  
  const message = String(error?.message || error?.reason?.message || error || '')
  const name = String(error?.name || error?.reason?.name || '')
  
  return suppressedPatterns.some(pattern => 
    message.includes(pattern) || name.includes(pattern)
  )
}

// Install global handlers immediately (before React mounts)
if (typeof window !== 'undefined') {
  const handleError = (event: ErrorEvent) => {
    if (shouldSuppress(event.error) || shouldSuppress(event.message)) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (shouldSuppress(event.reason)) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  window.addEventListener('error', handleError, true)
  window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
}

/**
 * Suppresses known non-critical errors from Supabase and other libraries
 * These errors don't affect functionality but create console noise
 */
export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress known errors
    const handleError = (event: ErrorEvent) => {
      if (shouldSuppress(event.error) || shouldSuppress(event.message)) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    // Suppress unhandled promise rejections for the same errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (shouldSuppress(event.reason)) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    // Add listeners with capture to intercept early
    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)

    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
    }
  }, [])

  return null
}
