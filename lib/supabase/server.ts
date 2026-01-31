'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for server-side operations.
 * This reads the auth token from cookies set by the browser client.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a lightweight stub client when env vars are missing so server-side
    // code can safely run in environments without Supabase configured.
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({ select: async () => ({ data: null, error: null }) }),
    } as any
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        // Pass the auth token if it exists in cookies
        authorization: cookieStore.get('sb-auth-token')?.value 
          ? `Bearer ${cookieStore.get('sb-auth-token')?.value}`
          : '',
      },
    },
  })
}

/**
 * Get the current user session on the server.
 * Returns null if no session exists.
 */
export async function getServerSession() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[Server Auth] Error getting session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('[Server Auth] Exception getting session:', error)
    return null
  }
}

/**
 * Get the current authenticated user on the server.
 * Returns null if no user is authenticated.
 */
export async function getServerUser() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('[Server Auth] Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('[Server Auth] Exception getting user:', error)
    return null
  }
}
