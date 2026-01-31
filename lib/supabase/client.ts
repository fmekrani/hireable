import { createClient } from '@supabase/supabase-js'

// Safely create the Supabase client only when environment variables are provided.
// This prevents runtime build/SSR failures when running locally without env vars.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = (supabaseUrl && supabaseAnonKey)
	? createClient(supabaseUrl, supabaseAnonKey)
	: ({} as any)
