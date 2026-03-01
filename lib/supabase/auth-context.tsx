'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@/lib/supabase/types'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const hasSupabaseAuth =
    typeof (supabase as any)?.auth?.getSession === 'function' &&
    typeof (supabase as any)?.auth?.onAuthStateChange === 'function'

  // Check session on mount
  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    if (!hasSupabaseAuth) {
      console.warn('[Auth] Supabase client not configured. Skipping auth init.')
      setLoading(false)
      return () => {
        isMounted = false
        abortController.abort()
      }
    }

    const initializeAuth = async () => {
      try {
        // Add a timeout to prevent blocking (3 seconds max)
        const sessionPromise = supabase.auth.getSession().catch((err: any) => {
          console.warn('[Auth] getSession failed:', err?.message)
          return { data: { session: null }, error: err }
        })
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: new Error('Auth session timeout') }), 3000)
        )

        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]) as any
          const initialSession = result?.data?.session || null

          if (!isMounted || abortController.signal.aborted) return

          setSession(initialSession)
          if (isMounted && !abortController.signal.aborted) {
            setLoading(false)
          }

          // Fetch user profile if session exists (non-blocking for UI)
          if (initialSession?.user?.id) {
            try {
              const userQuery = supabase
                .from('users')
                .select('*')
                .eq('id', initialSession.user.id)
                .maybeSingle()
                .catch((err: any) => {
                  console.warn('[Auth] User query failed:', err?.message)
                  return { data: null, error: err }
                })

              const { data: userData, error } = await userQuery

              if (isMounted && !abortController.signal.aborted) {
                if (!error && userData) {
                  setUser(userData)
                } else {
                  if (error) {
                    // Log error for debugging
                    console.warn('[Auth] Query error fetching user profile:', {
                      code: error?.code,
                      message: error?.message,
                      userId: initialSession.user.id,
                    })
                  }
                  // userData can be null if user profile doesn't exist yet - that's OK
                  // Fallback to session user so UI reflects signed-in state.
                  setUser({
                    id: initialSession.user.id,
                    email: initialSession.user.email ?? '',
                    full_name: initialSession.user.user_metadata?.full_name,
                    avatar_url: initialSession.user.user_metadata?.avatar_url,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                }
              }
            } catch (err) {
              if (abortController.signal.aborted) return
              console.warn('[Auth] Exception fetching user profile:', err)
            }
          }
        } catch (sessionError) {
          if (abortController.signal.aborted) return
          // Session check failed or timed out, continue without auth
          console.warn('[Auth] Session check failed/timed out:', sessionError)
          setSession(null)
          setLoading(false)
        }
      } catch (error) {
        if (abortController.signal.aborted) return
        console.error('Error initializing auth:', error)
        setLoading(false)
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    let authListener: any = null
    try {
      const result = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (!isMounted || abortController.signal.aborted) return

          try {
            console.log('[Auth Context] Auth state changed:', event, 'user:', currentSession?.user?.id)
            setSession(currentSession)

            if (event === 'SIGNED_OUT') {
              setUser(null)
            } else if (currentSession?.user?.id) {
              console.log('[Auth Context] Fetching user profile for:', currentSession.user.id)
              
              try {
                const { data: userData, error } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', currentSession.user.id)
                  .maybeSingle()

                console.log('[Auth Context] User fetch result - error:', error?.message, 'userData:', !!userData)

                if (isMounted && !abortController.signal.aborted) {
                  if (!error && userData) {
                    console.log('[Auth Context] User profile found:', userData.full_name)
                    setUser(userData)
                  } else if (!userData && !error) {
                    // User profile doesn't exist - create it (for OAuth users)
                    try {
                      console.log('[Auth Context] Creating user profile for OAuth user')
                      const fullName = currentSession.user.user_metadata?.full_name || 'User'
                      
                      const { data: newUser, error: insertError } = await supabase
                        .from('users')
                        .insert({
                          id: currentSession.user.id,
                          email: currentSession.user.email,
                          full_name: fullName,
                        })
                        .select()
                        .single()

                      if (isMounted && !abortController.signal.aborted) {
                        if (newUser && !insertError) {
                          console.log('[Auth Context] Profile created successfully:', newUser.full_name)
                          setUser(newUser)
                        } else if (insertError) {
                          console.warn('[Auth] Error creating user profile:', insertError?.message)
                        }
                      }
                    } catch (insertErr) {
                      console.warn('[Auth] Exception creating user profile:', insertErr)
                    }
                  } else if (error) {
                    console.warn('[Auth] Query error on auth state change:', error?.message)
                  }

                  // Fallback: use session user data if no profile found
                  if (!userData) {
                    setUser({
                      id: currentSession.user.id,
                      email: currentSession.user.email ?? '',
                      full_name: currentSession.user.user_metadata?.full_name,
                      avatar_url: currentSession.user.user_metadata?.avatar_url,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                  }
                }
              } catch (queryErr) {
                console.warn('[Auth] Exception fetching user profile:', queryErr)
                // Fallback to session user
                if (isMounted && !abortController.signal.aborted) {
                  setUser({
                    id: currentSession.user.id,
                    email: currentSession.user.email ?? '',
                    full_name: currentSession.user.user_metadata?.full_name,
                    avatar_url: currentSession.user.user_metadata?.avatar_url,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                }
              }
            }
          } catch (err) {
            console.warn('[Auth] Error in auth state change handler:', err)
          }
        }
      )
      authListener = result?.data
    } catch (err) {
      console.warn('[Auth] Failed to setup auth listener:', err)
    }

    return () => {
      isMounted = false
      abortController.abort()
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!hasSupabaseAuth) {
      throw new Error('Supabase client is not configured')
    }
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) throw signUpError

    const userId = data.user?.id
    if (!userId) {
      throw new Error('Failed to get user ID after signup')
    }

    // Create user profile (fallback if trigger doesn't fire immediately)
    try {
      await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          full_name: fullName,
        })
        .select()

      // Success - profile was created or already exists from trigger
    } catch (err: any) {
      // Ignore duplicate key errors (profile already created by trigger)
      if (err?.code !== 'PGRST103' && err?.message?.includes('duplicate')) {
        console.warn('[Auth] Profile creation note:', err?.message)
      }
      // Don't throw - the trigger may have created it
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!hasSupabaseAuth) {
      throw new Error('Supabase client is not configured')
    }
    
    try {
      console.log('[Auth] Attempting sign in for:', email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[Auth] Sign in error:', error)
        throw new Error(`Sign in failed: ${error.message}`)
      }
      console.log('[Auth] Sign in successful for:', email)
    } catch (err) {
      console.error('[Auth] Sign in exception:', err)
      throw err
    }
  }

  const signOut = async () => {
    if (!hasSupabaseAuth) {
      throw new Error('Supabase client is not configured')
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    if (!hasSupabaseAuth) {
      throw new Error('Supabase client is not configured')
    }
    
    try {
      console.log('[Auth] Attempting OAuth sign in with:', provider)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('[Auth] OAuth error:', error)
        throw new Error(`OAuth sign in failed: ${error.message}`)
      }
      console.log('[Auth] OAuth initiated for:', provider)
    } catch (err) {
      console.error('[Auth] OAuth exception:', err)
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        signInWithOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
