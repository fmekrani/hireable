'use client'

import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function CalendarPage() {
  const currentDate = new Date()
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = currentDate.getDate()

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
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            <p className="text-sm text-slate-500">Plan your prep schedule</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-900">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-slate-400 py-3 text-xs uppercase tracking-wide"
              >
                {day}
              </div>
            ))}

            {/* Empty cells */}
            {emptyDays.map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square p-2" />
            ))}

            {/* Days */}
            {days.map((day) => (
              <button
                key={day}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                  day === today
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent hover:border-indigo-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
