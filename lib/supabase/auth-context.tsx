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
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        )

        const {
          data: { session: initialSession },
        } = (await Promise.race([sessionPromise, timeoutPromise])) as Awaited<ReturnType<typeof supabase.auth.getSession>>

        if (!isMounted || abortController.signal.aborted) return

        setSession(initialSession)
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false)
        }

        // Fetch user profile if session exists (non-blocking for UI with timeout)
        if (initialSession?.user?.id) {
          const userFetchPromise = supabase
            .from('users')
            .select('*')
            .eq('id', initialSession.user.id)
            .maybeSingle()

          const userFetchTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          )

          try {
            const { data: userData, error } = (await Promise.race([
              userFetchPromise,
              userFetchTimeout,
            ])) as Awaited<typeof userFetchPromise>

            if (isMounted && !abortController.signal.aborted) {
              if (!error && userData) {
                setUser(userData)
              } else {
                // Fallback to session user so UI reflects signed-in state
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
            // Profile fetch failed or timed out - use session user instead
            if (isMounted && !abortController.signal.aborted) {
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
        }
      } catch (error) {
        if (abortController.signal.aborted) return
        // Session check failed or timed out - continue without loading
        if (isMounted && !abortController.signal.aborted) {
          setSession(null)
          setLoading(false)
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted || abortController.signal.aborted) return

        setSession(currentSession)

        if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (currentSession?.user?.id) {
          try {
            const userFetchPromise = supabase
              .from('users')
              .select('*')
              .eq('id', currentSession.user.id)
              .maybeSingle()

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 2000)
            )

            try {
              const { data: userData, error } = (await Promise.race([
                userFetchPromise,
                timeoutPromise,
              ])) as Awaited<typeof userFetchPromise>

              if (isMounted && !abortController.signal.aborted) {
                if (!error && userData) {
                  setUser(userData)
                } else if (!userData && !error) {
                  // User profile doesn't exist - create it (for OAuth users)
                  try {
                    const fullName = currentSession.user.user_metadata?.full_name || 'User'

                    const { data: newUser } = await supabase
                      .from('users')
                      .insert({
                        id: currentSession.user.id,
                        email: currentSession.user.email,
                        full_name: fullName,
                      })
                      .select()
                      .single()

                    if (isMounted && !abortController.signal.aborted && newUser) {
                      setUser(newUser)
                    } else {
                      setUser({
                        id: currentSession.user.id,
                        email: currentSession.user.email ?? '',
                        full_name: fullName,
                        avatar_url: currentSession.user.user_metadata?.avatar_url,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      })
                    }
                  } catch {
                    // Profile creation failed - use session user
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
                } else if (!userData) {
                  // Fallback to session user
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
            } catch {
              // Fetch timed out or failed - use session user
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
          } catch {
            // General error - use session user
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
      }
    )

    return () => {
      isMounted = false
      abortController.abort()
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!hasSupabaseAuth) {
      throw new Error('Supabase client is not configured')
    }
    
    // Clear previous user's data from localStorage
    localStorage.removeItem('savedAnalyses')
    localStorage.removeItem('savedAnalysesData')
    
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
    
    // Clear previous user's data from localStorage
    localStorage.removeItem('savedAnalyses')
    localStorage.removeItem('savedAnalysesData')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    if (!hasSupabaseAuth) {
      throw new Error('Supabase client is not configured')
    }
    
    // Clear user-specific data from localStorage
    localStorage.removeItem('savedAnalyses')
    localStorage.removeItem('savedAnalysesData')
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    if (!hasSupabaseAuth) {
      throw new Error('Supabase client is not configured')
    }
    
    // Clear previous user's data from localStorage
    localStorage.removeItem('savedAnalyses')
    localStorage.removeItem('savedAnalysesData')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
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
