/**
 * Verify a Supabase JWT token by calling the Supabase auth endpoint
 * This is the most reliable way to verify tokens on the server side
 */
import { createClient } from '@supabase/supabase-js'

export async function verifySupabaseToken(token: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Token Verify] Missing Supabase credentials')
      return null
    }

    // Create Supabase client with service role key and the user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Verify the token by getting the user
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('[Token Verify] Token verification failed:', error?.message)
      return null
    }

    return user
  } catch (error) {
    console.error('[Token Verify] Error verifying token:', error)
    return null
  }
}
