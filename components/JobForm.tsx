'use client'

import React, { useState, useRef } from 'react'
import { Job, JobResult } from '@/lib/mockData'

interface JobFormProps {
  selectedJob: Job | null
  onAnalyze: () => void
  onResultsChange: (results: JobResult | null) => void
}

export default function JobForm({
  selectedJob,
  onAnalyze,
  onResultsChange,
}: JobFormProps) {
  const [url, setUrl] = useState(selectedJob?.url || '')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const coverLetterInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyze = () => {
    setUrl('')
    setResumeFile(null)
    setCoverLetterFile(null)
    onAnalyze()
  }

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const handleCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverLetterFile(file)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Analysis</h3>

      {/* URL Input */}
      <div className="mb-4">
        <label
          htmlFor="job-url"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Job Posting URL
        </label>
        <input
          id="job-url"
          type="url"
          placeholder="Paste job posting URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Resume Upload */}
      <div className="mb-4">
        <label
          htmlFor="resume-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Attach Resume
        </label>
        <input
          ref={resumeInputRef}
          id="resume-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeChange}
          className="hidden"
          aria-label="Upload resume file"
        />
        <button
          onClick={() => resumeInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition text-center"
        >
          <p className="text-sm text-gray-600">
            {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
          </p>
          {!resumeFile && (
            <p className="text-xs text-gray-400">PDF, DOC, or DOCX</p>
          )}
        </button>
      </div>

      {/* Cover Letter Upload */}
      <div className="mb-4">
        <label
          htmlFor="cover-letter-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Attach Cover Letter
        </label>
        <input
          ref={coverLetterInputRef}
          id="cover-letter-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleCoverLetterChange}
          className="hidden"
          aria-label="Upload cover letter file"
        />
        <button
          onClick={() => coverLetterInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition text-center"
        >
          <p className="text-sm text-gray-600">
            {coverLetterFile
              ? coverLetterFile.name
              : 'Click to upload or drag and drop'}
          </p>
          {!coverLetterFile && (
            <p className="text-xs text-gray-400">PDF, DOC, or DOCX</p>
          )}
        </button>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        disabled={!url}
      >
        Analyze
      </button>
    </div>
  )
}
