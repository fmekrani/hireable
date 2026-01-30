'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'

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

  // Sample scheduled items
  const scheduledItems = [
    { day: 15, label: 'React Deep Dive', color: 'bg-primary' },
    { day: 18, label: 'System Design', color: 'bg-accent' },
    { day: 22, label: 'Mock Interview', color: 'bg-teal-500' },
    { day: 25, label: 'TypeScript Review', color: 'bg-primary' },
  ]

  const getScheduledItem = (day: number) => scheduledItems.find(item => item.day === day)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Calendar className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Study Calendar</h1>
                <p className="text-muted-foreground">Plan your prep schedule based on your skill gaps</p>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>

          {/* Calendar Card */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border p-8">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-8">
              <button className="p-2 hover:bg-muted rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h2 className="text-2xl font-bold text-foreground">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <button className="p-2 hover:bg-muted rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-muted-foreground py-3 text-xs uppercase tracking-wide"
                >
                  {day}
                </div>
              ))}

              {/* Empty cells */}
              {emptyDays.map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square p-2" />
              ))}

              {/* Days */}
              {days.map((day) => {
                const scheduled = getScheduledItem(day)
                return (
                  <button
                    key={day}
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                      day === today
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                        : scheduled
                        ? 'bg-muted text-foreground hover:bg-primary/10 border border-border'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/30'
                    }`}
                  >
                    <span>{day}</span>
                    {scheduled && day !== today && (
                      <div className={`w-1.5 h-1.5 rounded-full ${scheduled.color} mt-1`} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Upcoming Events */}
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Upcoming Study Sessions</h3>
              <div className="space-y-3">
                {scheduledItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentDate.toLocaleDateString('en-US', { month: 'short' })} {item.day}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
