'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Mic, Play, Square, MessageCircle, Video, Sparkles } from 'lucide-react'

export default function MockInterviewPage() {
  const [started, setStarted] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Mock Interview</h1>
            <p className="text-sm text-slate-500">Practice makes perfect</p>
          </div>
        </div>

        {!started ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 p-10 text-center">
            <div className="flex justify-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Video className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Mic className="w-8 h-8 text-violet-600" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-teal-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Ready for a mock interview?
            </h2>

            <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
              Practice your interview skills with AI. Answer common questions and
              get real-time feedback on your responses.
            </p>

            <button
              onClick={() => setStarted(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 active:scale-[0.98]"
            >
              <Play className="w-5 h-5" />
              <span>Start Interview</span>
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 overflow-hidden">
            {/* Interview header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Interview in Progress</p>
                  <p className="text-xs text-white/70">Question 1 of 5</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-medium">Recording</span>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl p-6 mb-6 border border-slate-200/60">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Question</p>
                <p className="text-lg font-semibold text-slate-900">
                  Tell me about yourself and your experience.
                </p>
              </div>

              <textarea
                placeholder="Type your answer here or use voice recording..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all resize-none h-32 mb-6"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStarted(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  <Square className="w-4 h-4" />
                  <span>End Interview</span>
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]">
                  <span>Next Question</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
