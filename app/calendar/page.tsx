'use client'

import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 block">
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 py-2 text-sm"
              >
                {day}
              </div>
            ))}

            {/* Empty cells */}
            {emptyDays.map((_, idx) => (
              <div key={`empty-${idx}`} className="p-4" />
            ))}

            {/* Days */}
            {days.map((day) => (
              <button
                key={day}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-center"
              >
                <span className="font-semibold text-gray-800">{day}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
