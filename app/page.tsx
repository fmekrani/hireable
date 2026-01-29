'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import JobForm from '@/components/JobForm'
import ResultsCards from '@/components/ResultsCards'
import ChatWidget from '@/components/ChatWidget'
import { mockJobs, mockResults, JobResult } from '@/lib/mockData'
import { LogOut } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, session, signOut } = useAuth()
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [results, setResults] = useState<JobResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const selectedJob = selectedJobId
    ? mockJobs.find((job) => job.id === selectedJobId)
    : null

  const handleSelectJob = (jobId: string | null) => {
    setSelectedJobId(jobId)

    if (jobId && mockResults[jobId]) {
      setResults(mockResults[jobId])
    } else {
      setResults(null)
    }
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate loading delay
    setTimeout(() => {
      setResults(mockResults['1'])
      setIsAnalyzing(false)
    }, 2000)
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
    <div className="flex h-screen flex-col">
      {/* Signed in banner */}
      {session && user && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 shadow-lg z-50 flex items-center justify-between">
          <span className="font-semibold">✅ Signed in as {user.full_name || user.email}</span>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-4 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          jobs={mockJobs}
          selectedJobId={selectedJobId}
          onSelectJob={handleSelectJob}
        />

        {/* Main content */}
        <main className="flex-1 md:ml-0 ml-0 overflow-auto">
        {/* Top bar */}
        <TopBar />

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-6 pb-20 md:pb-6">
          <JobForm
            selectedJob={selectedJob ?? null}
            onAnalyze={handleAnalyze}
            onResultsChange={setResults}
            isAnalyzing={isAnalyzing}
          />

          <ResultsCards results={results} isLoading={isAnalyzing} />

          {/* Mobile chat */}
          <div className="md:hidden">
            <ChatWidget />
          </div>
        </div>
      </main>

      {/* Desktop chat */}
      <div className="hidden md:block">
        <ChatWidget />
      </div>
      </div>
    </div>
  )
}
