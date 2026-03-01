/**
 * Verify a Supabase JWT token and get user from it
 */
import { createClient } from '@supabase/supabase-js'

export async function verifySupabaseToken(token: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Token Verify] Missing Supabase credentials')
      return null
    }

    // Create Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Get user from the token
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('[Token Verify] Failed to get user:', error.message)
      return null
    }

    if (!user) {
      console.error('[Token Verify] No user found in token')
      return null
    }

    return user
  } catch (error) {
    console.error('[Token Verify] Error verifying token:', error)
    return null
  }
}
