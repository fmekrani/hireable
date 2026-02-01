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

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (!isMounted) return

        setSession(initialSession)

        // Fetch user profile if session exists
        if (initialSession?.user?.id) {
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', initialSession.user.id)
              .maybeSingle()

            if (isMounted) {
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
            if (isMounted) {
              console.error('[Auth] Exception fetching user profile:', err)
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error initializing auth:', error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return

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

            console.log('[Auth Context] User fetch result - error:', error?.message, 'userData:', !!userData)

            if (isMounted) {
              if (!error && userData) {
                console.log('[Auth Context] User profile found:', userData.full_name)
                setUser(userData)
              } else {
                // Fetch failed or no data - create user profile from session data
                // This handles both email/password and OAuth users
                console.log('[Auth Context] Creating/setting user from session data')
                const fullName = currentSession.user.user_metadata?.full_name 
                  || currentSession.user.user_metadata?.name
                  || currentSession.user.email 
                  || 'User'
                
                const userData = {
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  full_name: fullName,
                } as User
                
                console.log('[Auth Context] Setting user:', userData.full_name)
                setUser(userData)
              }
            }
          } catch (error) {
            if (isMounted) {
              console.error('[Auth] Exception on auth state change:', error)
              // Even if fetch throws error, set user from session data
              const fullName = currentSession.user.user_metadata?.full_name 
                || currentSession.user.user_metadata?.name
                || currentSession.user.email 
                || 'User'
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email,
                full_name: fullName,
              } as User)
            }
          }
        }
      }
    )

    return () => {
      isMounted = false
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
    try {
      console.log('[Auth] signOut called')
      const { error } = await supabase.auth.signOut()
      console.log('[Auth] signOut result - error:', error?.message)
      
      // Ignore AbortError - it's a known Supabase issue that doesn't prevent sign-out
      if (error && !error.message?.includes('AbortError') && error.message !== 'signal is aborted without reason') {
        throw error
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.log('[Auth] signOut error (suppressed):', errMsg)
      // Don't throw - suppress the AbortError and proceed with local sign-out
    }
    
    // Force clear the user state locally
    console.log('[Auth] Clearing user state locally')
    setUser(null)
    setSession(null)
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
