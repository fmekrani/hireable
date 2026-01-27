'use client'

import React from 'react'
import { JobResult } from '@/lib/mockData'

interface ResultsCardsProps {
  results: JobResult | null
}

export default function ResultsCards({ results }: ResultsCardsProps) {
  if (!results) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Skills Required Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Skills Required
        </h3>
        <div className="space-y-2">
          {results.skills.map((skill, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="text-sm font-medium text-gray-800">{skill}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {skill}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Resources Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
        <div className="space-y-4">
          {results.resources.map((item, idx) => (
            <div key={idx}>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                {item.skill}
              </p>
              <ul className="space-y-1">
                {item.links.map((link, linkIdx) => (
                  <li key={linkIdx} className="text-xs text-blue-600">
                    • {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="space-y-4">
          {results.timeline.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-800">
                  {item.skill}
                </p>
                <span className="text-xs text-gray-500">{item.weeks}w</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(item.weeks * 20, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={item.weeks}
                  aria-valuemin={0}
                  aria-valuemax={5}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
