"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, LogOut, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/supabase/auth-context"
import { useState } from "react"

interface FloatingHeaderProps {
  className?: string
}

export function FloatingHeader({ className }: FloatingHeaderProps) {
  const router = useRouter()
  const { session, user, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  if (!session) {
    return (
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 pointer-events-none",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          {/* Brand */}
          <Link 
            href="/" 
            className="pointer-events-auto group flex items-center gap-2"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative"
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              
              {/* Logo container */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-white font-bold text-lg">H</span>
              </div>
            </motion.div>
            
            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Hireable<span className="text-violet-400">.ai</span>
            </span>
          </Link>

          {/* Login Button */}
          <Link href="/sign-in" className="pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative px-6 py-2 rounded-lg font-semibold text-white"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg opacity-50 blur group-hover:opacity-100 transition-all" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg" />
              <span className="relative flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </span>
            </motion.button>
          </Link>
        </div>
      </motion.header>
    )
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 pointer-events-none",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Brand */}
        <Link 
          href="/" 
          className="pointer-events-auto group flex items-center gap-2"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Logo container */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-lg">H</span>
            </div>
          </motion.div>
          
          <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Hireable<span className="text-violet-400">.ai</span>
          </span>
        </Link>

        {/* Profile Dropdown */}
        <div className="pointer-events-auto relative">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative group"
          >
            {/* Glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full opacity-0 group-hover:opacity-70 blur transition-opacity duration-500" />
            
            {/* Button */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg group-hover:border-violet-500/50 transition-all duration-400 overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors duration-400" />
              )}
            </div>
            
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
          </motion.button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-full right-0 mt-2 w-48 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-xl shadow-xl overflow-hidden backdrop-blur"
            >
              {/* User Info */}
              <div className="p-4 border-b border-white/10">
                <p className="text-sm text-white/60">Signed in as</p>
                <p className="font-semibold text-white truncate">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <nav className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowDropdown(false)
                    // Use setTimeout to ensure state updates before navigation
                    setTimeout(() => {
                      router.refresh()
                      router.push('/profile')
                    }, 0)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/5 rounded-lg transition text-sm cursor-pointer active:bg-white/10"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowDropdown(false)
                    // Use setTimeout to ensure state updates before navigation
                    setTimeout(() => {
                      router.refresh()
                      router.push('/dashboard')
                    }, 0)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/5 rounded-lg transition text-sm cursor-pointer active:bg-white/10"
                >
                  <span>📊</span>
                  Dashboard
                </button>

                <hr className="my-2 border-white/10" />

                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsSigning(true)
                    setShowDropdown(false)
                    try {
                      await signOut()
                      router.push('/sign-in')
                    } catch (error) {
                      console.error('Sign out error:', error)
                      setIsSigning(false)
                    }
                  }}
                  disabled={isSigning}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition text-sm disabled:opacity-50 cursor-pointer active:bg-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  {isSigning ? 'Signing out...' : 'Sign Out'}
                </button>
              </nav>
            </motion.div>
          )}

          {/* Backdrop */}
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDropdown(false)}
              className="fixed inset-0 z-40"
            />
          )}
        </div>
      </div>
    </motion.header>
  )
}
