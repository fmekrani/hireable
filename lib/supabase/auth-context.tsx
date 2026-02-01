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

  // Check session on mount
  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (!isMounted || abortController.signal.aborted) return

        setSession(initialSession)

        // Fetch user profile if session exists
        if (initialSession?.user?.id) {
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', initialSession.user.id)
              .maybeSingle()

            if (isMounted && !abortController.signal.aborted) {
              if (!error && userData) {
                setUser(userData)
              } else if (error) {
                // Log error for debugging
                console.error('[Auth] Query error fetching user profile:', {
                  code: error.code,
                  message: error.message,
                  userId: initialSession.user.id,
                })
              }
              // userData can be null if user profile doesn't exist yet - that's OK
            }
          } catch (err) {
            if (isMounted && !abortController.signal.aborted) {
              console.error('[Auth] Exception fetching user profile:', err)
            }
          }
        }
      } catch (error) {
        if (isMounted && !abortController.signal.aborted) {
          console.error('Error initializing auth:', error)
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

        console.log('[Auth Context] Auth state changed:', event, 'user:', currentSession?.user?.id)
        setSession(currentSession)

        if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (currentSession?.user?.id) {
          try {
            console.log('[Auth Context] Fetching user profile for:', currentSession.user.id)
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', currentSession.user.id)
              .maybeSingle()

            if (!isMounted || abortController.signal.aborted) return

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
                  console.log('[Auth Context] Using full_name:', fullName)
                  
                  const { data: newUser, error: insertError } = await supabase
                    .from('users')
                    .insert({
                      id: currentSession.user.id,
                      email: currentSession.user.email,
                      full_name: fullName,
                    })
                    .select()
                    .single()

                  if (!isMounted || abortController.signal.aborted) return

                  console.log('[Auth Context] Profile creation result - error:', insertError?.message, 'newUser:', !!newUser)

                  if (isMounted && !abortController.signal.aborted) {
                    if (newUser && !insertError) {
                      console.log('[Auth Context] Profile created successfully:', newUser.full_name)
                      setUser(newUser)
                    } else if (insertError) {
                      console.warn('[Auth] Error creating user profile:', insertError?.message)
                    }
                  }
                } catch (insertErr) {
                  if (isMounted && !abortController.signal.aborted) {
                    console.warn('[Auth] Exception creating user profile:', insertErr)
                  }
                }
              } else if (error) {
                console.error('[Auth] Query error on auth state change:', {
                  code: error.code,
                  message: error.message,
                  event,
                  userId: currentSession.user.id,
                })
              }
            }
          } catch (error) {
            if (isMounted && !abortController.signal.aborted) {
              console.error('[Auth] Exception on auth state change:', error)
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
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
