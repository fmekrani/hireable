'use client'

import React from 'react'
import { 
  Zap, 
  BookOpen, 
  Clock, 
  Copy, 
  ExternalLink,
  Video,
  FileText,
  CheckCircle2,
  Lightbulb,
  Target,
  Wrench
} from 'lucide-react'
import { JobResult } from '@/lib/mockData'

interface ResultsCardsProps {
  results: JobResult | null
  isLoading?: boolean
}

// Skill category colors
const skillCategories: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'React': { label: 'Core', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Target },
  'TypeScript': { label: 'Core', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Target },
  'JavaScript': { label: 'Core', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Target },
  'Python': { label: 'Core', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Target },
  'Node.js': { label: 'Tools', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Wrench },
  'GraphQL': { label: 'Tools', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Wrench },
  'PostgreSQL': { label: 'Tools', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Wrench },
  'AWS': { label: 'Tools', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Wrench },
  'Docker': { label: 'Tools', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Wrench },
  'System Design': { label: 'Concepts', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: Lightbulb },
}

function getSkillCategory(skill: string) {
  return skillCategories[skill] || { label: 'Skill', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Zap }
}

function SkeletonCard() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 p-6">
      <div className="h-6 w-32 bg-slate-200 rounded-lg mb-4 skeleton" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-xl skeleton" />
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/60 p-12 text-center mb-6">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <Zap className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-violet-600" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to analyze</h3>
        <p className="text-slate-500 text-sm">
          Upload a job posting and your resume to get personalized skill insights, learning resources, and a study timeline.
        </p>
      </div>
    </div>
  )
}

export default function ResultsCards({ results, isLoading = false }: ResultsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!results) {
    return <EmptyState />
  }

  const totalWeeks = results.timeline.reduce((sum, item) => sum + item.weeks, 0)

  const copySkills = () => {
    navigator.clipboard.writeText(results.skills.join(', '))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Skills Required Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Skills Required</h3>
          </div>
          <button 
            onClick={copySkills}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
            title="Copy skills"
          >
            <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {results.skills.map((skill, idx) => {
            const category = getSkillCategory(skill)
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${category.color}`}
              >
                <category.icon className="w-3 h-3" />
                {skill}
              </span>
            )
          })}
        </div>
      </div>

      {/* Resources Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-violet-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Resources</h3>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {results.resources.slice(0, 4).map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {item.skill}
              </p>
              <div className="space-y-2">
                {item.links.map((link, linkIdx) => (
                  <div key={linkIdx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {linkIdx === 0 ? (
                        <Video className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      )}
                      <span className="text-sm text-slate-700 truncate">{link}</span>
                    </div>
                    <button className="p-1 hover:bg-violet-100 rounded transition-colors flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-violet-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Timeline</h3>
        </div>
        
        {/* Total summary */}
        <div className="mb-4 p-3 bg-gradient-to-r from-teal-50 to-indigo-50 rounded-xl border border-teal-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Total Prep Time</span>
            <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
              {totalWeeks} weeks
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {results.timeline.map((item, idx) => (
            <div key={idx} className="relative">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {item.skill}
                    </p>
                    <span className="text-xs font-semibold text-slate-500 ml-2">{item.weeks}w</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${Math.min(item.weeks * 20, 100)}%` }}
                      role="progressbar"
                      aria-valuenow={item.weeks}
                      aria-valuemin={0}
                      aria-valuemax={5}
                    />
                  </div>
                </div>
              </div>
              {idx < results.timeline.length - 1 && (
                <div className="absolute left-3 top-8 w-px h-4 bg-slate-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
