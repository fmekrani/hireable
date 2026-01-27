'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  Mic, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react'

interface TopBarProps {
  title?: string
  subtitle?: string
}

export default function TopBar({ 
  title = "Job Prep Dashboard",
  subtitle = "Analyze jobs, build skills, ace interviews"
}: TopBarProps) {
  return (
    <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left section - Breadcrumbs & Title */}
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600 font-medium">Analysis</span>
            </div>
            
            {/* Title & Subtitle */}
            <h1 className="text-2xl font-bold text-slate-900">
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          {/* Right section - Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-sm font-medium text-slate-700 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </Link>
            <Link
              href="/mock-interview"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1"
            >
              <Mic className="w-4 h-4" />
              <span>Mock Interview</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
