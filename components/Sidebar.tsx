'use client'

import React, { useState } from 'react'
import { 
  Briefcase, 
  Search, 
  Plus, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react'
import { Job } from '@/lib/mockData'

interface SidebarProps {
  jobs: Job[]
  selectedJobId: string | null
  onSelectJob: (jobId: string | null) => void
}

export default function Sidebar({
  jobs,
  selectedJobId,
  onSelectJob,
}: SidebarProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-2.5 rounded-xl shadow-lg active:scale-[0.98] transition-transform duration-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transform transition-all duration-300 ease-out md:transform-none md:relative md:inset-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } z-40 md:z-auto flex flex-col`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Hireable</h1>
              <p className="text-xs text-slate-500">Job Prep Assistant</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-700">Previous Jobs</h2>
            </div>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              {jobs.length}
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 transition-colors hover:bg-slate-100/80"
              aria-label="Search previous jobs"
            />
          </div>

          {/* Jobs list */}
          <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No jobs found</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => {
                    onSelectJob(job.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 group relative ${
                    selectedJobId === job.id
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 shadow-sm'
                      : 'bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm hover:-translate-y-0.5'
                  }`}
                  aria-current={selectedJobId === job.id ? 'page' : undefined}
                >
                  {/* Selected indicator */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-200 ${
                    selectedJobId === job.id ? 'bg-gradient-to-b from-indigo-600 to-violet-600' : 'bg-transparent group-hover:bg-slate-300'
                  }`} />
                  
                  <div className="pl-2">
                    <p className="font-semibold text-sm text-slate-800 mb-0.5 line-clamp-1">
                      {job.title}
                    </p>
                    <p className="text-xs text-slate-500 mb-1">{job.company}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {new Date(job.dateAdded).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* New button - sticky bottom */}
        <div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
          <button
            onClick={() => {
              onSelectJob(null)
              setSearch('')
              setIsOpen(false)
            }}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Analysis</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm md:hidden z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
