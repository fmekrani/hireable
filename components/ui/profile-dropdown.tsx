'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, LogIn, User as UserIcon, Mail } from 'lucide-react'

export const ProfileDropdown = () => {
  const { session, user, loading, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const isProfileLoading = !!session && !user

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      console.log('[ProfileDropdown] Starting sign out...')
      await signOut()
      console.log('[ProfileDropdown] Sign out successful')
      setIsOpen(false)
      console.log('[ProfileDropdown] Redirecting to home')
      router.push('/')
    } catch (error) {
      console.error('[ProfileDropdown] Sign out error:', error)
      alert('Failed to sign out: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleSignIn = () => {
    router.push('/sign-in')
    setIsOpen(false)
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
      >
        {session && user ? (
          <span className="text-sm font-bold">
            {getInitials(user.full_name)}
          </span>
        ) : (
          <UserIcon className="w-5 h-5" />
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white text-black rounded-2xl border border-black/10 shadow-2xl overflow-hidden z-50"
          >
            {/* User Info Section */}
            {session && user ? (
              <>
                <div className="px-6 py-4 border-b border-black/10 bg-gradient-to-r from-gray-100 to-gray-50">
                  {/* Avatar */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-black/10 flex items-center justify-center shadow-md">
                      <span className="text-lg font-bold text-black">
                        {getInitials(user.full_name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-black font-semibold truncate">
                        {user.full_name || 'User'}
                      </p>
                      <p className="text-black/60 text-sm truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                    <span className="text-xs text-green-700 font-medium">Signed in</span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="w-full px-6 py-3 flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors border-t border-black/10 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </>
            ) : isProfileLoading ? (
              <div className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-black/5 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 bg-black/10 rounded animate-pulse" />
                    <div className="h-3 w-40 bg-black/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 h-3 w-20 bg-black/10 rounded animate-pulse" />
              </div>
            ) : (
              <motion.button
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                onClick={handleSignIn}
                className="w-full px-6 py-4 flex items-center justify-center gap-2 text-black hover:text-black/80 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </motion.button>
            )}

            {/* Quick Links */}
            {session && user && (
              <div className="px-6 py-3 border-t border-black/10 space-y-2">
                <button className="w-full text-left text-xs text-black/60 hover:text-black/80 py-2 transition-colors">
                  Account Settings
                </button>
                <button className="w-full text-left text-xs text-black/60 hover:text-black/80 py-2 transition-colors">
                  Help & Support
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
