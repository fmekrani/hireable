'use client'

import { useEffect } from 'react'

/**
 * Suppresses known non-critical errors from Supabase
 * The AbortError from locks.js is a known Supabase issue that doesn't affect functionality
 */
export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress Supabase lock AbortError
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes('signal is aborted') ||
        event.error?.name === 'AbortError'
      ) {
        // Suppress this known Supabase issue
        event.preventDefault()
      }
    }

    // Suppress unhandled promise rejections for the same error
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('signal is aborted') ||
        event.reason?.name === 'AbortError'
      ) {
        // Suppress this known Supabase issue
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
