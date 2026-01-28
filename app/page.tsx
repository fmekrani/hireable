'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import JobForm from '@/components/JobForm'
import ResultsCards from '@/components/ResultsCards'
import ChatWidget from '@/components/ChatWidget'
import { mockJobs, mockResults, JobResult } from '@/lib/mockData'

export default function Home() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [results, setResults] = useState<JobResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  return (
    <div className="flex h-screen">
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
  )
}
