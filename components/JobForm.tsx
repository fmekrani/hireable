'use client'

import React, { useState, useRef } from 'react'
import { 
  Link as LinkIcon, 
  FileText, 
  Upload, 
  Check, 
  X, 
  Loader2,
  Sparkles,
  FileUp,
  Mail
} from 'lucide-react'
import { Job, JobResult } from '@/lib/mockData'

interface JobFormProps {
  selectedJob: Job | null
  onAnalyze: () => void
  onResultsChange: (results: JobResult | null) => void
  isAnalyzing?: boolean
}

const steps = [
  { id: 1, label: 'Job URL', icon: LinkIcon },
  { id: 2, label: 'Resume', icon: FileUp },
  { id: 3, label: 'Cover Letter', icon: Mail },
  { id: 4, label: 'Analyze', icon: Sparkles },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function JobForm({
  selectedJob,
  onAnalyze,
  onResultsChange,
  isAnalyzing = false,
}: JobFormProps) {
  const [url, setUrl] = useState(selectedJob?.url || '')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const coverLetterInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyze = () => {
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

  const currentStep = url ? (resumeFile ? (coverLetterFile ? 4 : 3) : 2) : 1
  const canAnalyze = url && resumeFile

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 p-6 mb-6 transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Job Analysis</h3>
          <p className="text-sm text-slate-500 mt-0.5">Upload your documents to get personalized insights</p>
        </div>
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-full p-1">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                currentStep >= step.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <step.icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div className="mb-5">
        <label
          htmlFor="job-url"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Job Posting URL
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="job-url"
            type="url"
            placeholder="https://linkedin.com/jobs/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 focus:bg-white transition-all duration-200"
          />
          {url && (
            <button 
              onClick={() => setUrl('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Resume Upload */}
        <div>
          <label
            htmlFor="resume-upload"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Resume <span className="text-red-500">*</span>
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
            className={`w-full border-2 border-dashed rounded-xl p-4 transition-all duration-200 text-left group ${
              resumeFile 
                ? 'border-teal-300 bg-teal-50/50' 
                : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
          >
            {resumeFile ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{resumeFile.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(resumeFile.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                  className="p-1.5 hover:bg-teal-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-teal-600" />
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                  Upload Resume
                </p>
                <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX</p>
              </div>
            )}
          </button>
        </div>

        {/* Cover Letter Upload */}
        <div>
          <label
            htmlFor="cover-letter-upload"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Cover Letter <span className="text-slate-400 font-normal">(optional)</span>
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
            className={`w-full border-2 border-dashed rounded-xl p-4 transition-all duration-200 text-left group ${
              coverLetterFile 
                ? 'border-teal-300 bg-teal-50/50' 
                : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
          >
            {coverLetterFile ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{coverLetterFile.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(coverLetterFile.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setCoverLetterFile(null); }}
                  className="p-1.5 hover:bg-teal-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-teal-600" />
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                  <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                  Upload Cover Letter
                </p>
                <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX</p>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze || isAnalyzing}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
          canAnalyze && !isAnalyzing
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analyze Job Posting</span>
          </>
        )}
      </button>
    </div>
  )
}
