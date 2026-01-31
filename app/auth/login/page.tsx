'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/supabase/auth-context'
import { ArrowRight, Github, Mail, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithOAuth, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(email, password)
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      // Refresh router to sync server state
      router.refresh()
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('')
    setIsLoading(true)

    try {
      await signInWithOAuth(provider)
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`)
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
        {/* Left Side - Feature Highlights */}
        <div className="hidden lg:flex flex-col justify-center px-8">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Perfect</span> Job
            </h1>
            <p className="text-xl text-gray-600">
              AI-powered resume matching and career guidance
            </p>
          </div>

          <div className="space-y-6">
            {[
              { title: 'Smart Matching', desc: 'AI analyzes your resume against job requirements' },
              { title: 'Personalized Guidance', desc: 'Get tailored recommendations to improve your fit' },
              { title: 'Track Progress', desc: 'Monitor your readiness and skill development' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-4">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">
                Sign in to your account and continue your journey
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <div className="text-red-600 font-medium text-sm flex-1">{error}</div>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 group"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleOAuth('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 hover:border-gray-300 disabled:border-gray-200/50 text-gray-700 font-medium rounded-lg transition bg-white hover:bg-gray-50"
              >
                <Mail className="w-5 h-5" />
                Google
              </button>
              <button
                onClick={() => handleOAuth('github')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 hover:border-gray-300 disabled:border-gray-200/50 text-gray-700 font-medium rounded-lg transition bg-white hover:bg-gray-50"
              >
                <Github className="w-5 h-5" />
                GitHub
              </button>
            </div>

            <p className="text-center text-gray-600 mt-8">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
