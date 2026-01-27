'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import JobForm from '@/components/JobForm'
import ResultsCards from '@/components/ResultsCards'
import ChatWidget from '@/components/ChatWidget'
import { mockJobs, mockResults, Job, JobResult } from '@/lib/mockData'

export default function Home() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [results, setResults] = useState<JobResult | null>(null)

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
    // For a new job, load mock results from the first job
    setResults(mockResults['1'])
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        jobs={mockJobs}
        selectedJobId={selectedJobId}
        onSelectJob={handleSelectJob}
      />

      {/* Main content */}
      <main className="flex-1 md:ml-0 ml-0 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-30">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Job Prep Dashboard
            </h1>
            <div className="flex gap-3">
              <Link
                href="/calendar"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Calendar
              </Link>
              <Link
                href="/mock-interview"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Mock Interview
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-6 pb-20 md:pb-6">
          <JobForm
            selectedJob={selectedJob ?? null}
            onAnalyze={handleAnalyze}
            onResultsChange={setResults}
          />

          <ResultsCards results={results} />

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
  )
}
