'use client'

import React, { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(true)

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
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform md:transform-none md:relative md:inset-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-40 md:z-auto`}
      >
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Previous Jobs</h2>

          {/* Search */}
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search previous jobs"
          />

          {/* Jobs list */}
          <div className="flex-1 overflow-y-auto mb-4">
            {filteredJobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No jobs found</p>
            ) : (
              <ul className="space-y-2">
                {filteredJobs.map((job) => (
                  <li key={job.id}>
                    <button
                      onClick={() => {
                        onSelectJob(job.id)
                        setIsOpen(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedJobId === job.id
                          ? 'bg-blue-100 border-l-4 border-blue-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      aria-current={selectedJobId === job.id ? 'page' : undefined}
                    >
                      <p className="font-semibold text-sm text-gray-900">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-500">{job.company}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(job.dateAdded).toLocaleDateString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* New button */}
          <button
            onClick={() => {
              onSelectJob(null)
              setSearch('')
              setIsOpen(false)
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            + New
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
