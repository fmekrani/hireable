'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { motion } from 'framer-motion'
import { LogOut, ArrowLeft, Mail, Camera, Check, X } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, session, signOut, loading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setAvatarUrl(user.avatar_url || '')
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!session || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h1 className="text-3xl font-bold text-white mb-4">Not signed in</h1>
          <p className="text-white/60 mb-8">You need to be logged in to access your profile.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="group relative px-8 py-3 rounded-xl font-semibold text-white"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl opacity-70 blur-lg group-hover:opacity-100 transition-all" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl" />
            <span className="relative">Go to Login</span>
          </button>
        </motion.div>
      </div>
    )
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveChanges = async () => {
    if (!fullName.trim()) {
      setError('Name cannot be empty')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      let uploadedAvatarUrl = avatarUrl

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const fileName = `${user.id}-${Date.now()}.jpg`
        const { error: uploadError } = await supabaseAdmin.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data } = supabaseAdmin.storage
          .from('avatars')
          .getPublicUrl(fileName)

        uploadedAvatarUrl = data?.publicUrl || avatarUrl
      }

      // Update user profile in database
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          full_name: fullName,
          avatar_url: uploadedAvatarUrl,
          updated_at: new Date(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(uploadedAvatarUrl)
      setAvatarFile(null)
      setPreviewUrl('')
      setSuccess('Profile updated successfully!')
      setIsEditing(false)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 bg-black/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur border border-white/10 rounded-2xl p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-white/10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20 overflow-hidden">
                  {previewUrl || avatarUrl ? (
                    <img
                      src={previewUrl || avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-violet-600 rounded-lg cursor-pointer hover:bg-violet-700 transition shadow-lg">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-6 px-4 py-2 bg-zinc-700/50 border border-white/10 rounded-lg text-white text-center text-xl font-bold focus:outline-none focus:border-violet-500 transition"
                  placeholder="Enter your name"
                />
              ) : (
                <>
                  <h2 className="mt-6 text-3xl font-bold text-white">
                    {fullName || 'User'}
                  </h2>
                  <p className="text-white/40 mt-1">Account Owner</p>
                </>
              )}
            </div>

            {/* Email Info */}
            <div className="flex items-start gap-4 mb-8 pb-8 border-b border-white/10">
              <div className="p-3 bg-violet-500/10 rounded-lg">
                <Mail className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-white/40 mb-1">Email Address</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {success}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex-1 group relative px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl opacity-70 blur-lg group-hover:opacity-100 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl" />
                    <span className="relative flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFullName(user?.full_name || '')
                      setAvatarFile(null)
                      setPreviewUrl('')
                      setError('')
                    }}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 group relative px-6 py-3 rounded-xl font-semibold text-white"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl opacity-50 blur-lg group-hover:opacity-100 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl" />
                    <span className="relative">Edit Profile</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex-1 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 backdrop-blur border border-white/5 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="space-y-3 text-sm text-white/60">
              <p>
                <span className="text-white">User ID:</span> {user?.id}
              </p>
              <p>
                <span className="text-white">Member Since:</span>{' '}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Recently'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
