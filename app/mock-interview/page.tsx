'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MockInterviewPage() {
  const [started, setStarted] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 block">
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI Mock Interview
        </h1>

        {!started ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready for a mock interview?
            </h2>

            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Practice your interview skills with AI. Answer common questions and
              get feedback on your responses.
            </p>

            <button
              onClick={() => setStarted(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition inline-block"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <p className="text-gray-600 text-center mb-6">
              Interview session started. This is a placeholder for the AI
              interview feature.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 font-semibold mb-4">
                Question 1: Tell me about yourself
              </p>
              <input
                type="text"
                placeholder="Your answer here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setStarted(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-6 rounded-lg transition"
            >
              End Interview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
