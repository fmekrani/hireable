'use client'

import { motion } from 'framer-motion'
import { LimelightNav } from '@/components/ui/limelight-nav-new'
import { ProfileDropdown } from '@/components/ui/profile-dropdown'
import { Calendar, Home, BarChart3, Video, Sparkles, ArrowRight, Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react'

const navItems = [
  { id: "home", icon: <Home />, label: "Home", href: "/" },
  { id: "analysis", icon: <BarChart3 />, label: "Analysis", href: "/analysis" },
  { id: "interview", icon: <Video />, label: "Interview", href: "/interview" },
  { id: "calendar", icon: <Calendar />, label: "Calendar", href: "/calendar" },
]

const upcomingEvents = [
  { title: "System Design Study", date: "Today", time: "2:00 PM", duration: "2 hours", type: "study", completed: false },
  { title: "Mock Interview Prep", date: "Tomorrow", time: "10:00 AM", duration: "1 hour", type: "interview", completed: false },
  { title: "LeetCode Practice", date: "Feb 2", time: "3:00 PM", duration: "1.5 hours", type: "practice", completed: false },
]

const milestones = [
  { title: "Learn System Design", target: "Feb 15", progress: 65, icon: BookOpen },
  { title: "Complete 50 LeetCode Problems", target: "Feb 28", progress: 42, icon: CheckCircle },
  { title: "First Mock Interview", target: "Feb 5", progress: 100, icon: Video },
]

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black/80 text-white overflow-x-hidden">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <LimelightNav items={navItems} />
          <ProfileDropdown />
        </div>
      </div>

      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Study Calendar</h1>
                <p className="text-white/60">Track your learning milestones and progress</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Add Event */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-8 mb-12 hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Add Study Session</h3>
                <p className="text-white/60">Schedule your next learning milestone</p>
              </div>
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <button className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition-all flex items-center gap-2">
              Schedule Event
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Learning Milestones</h2>
            <div className="space-y-4">
              {milestones.map((milestone, i) => {
                const Icon = milestone.icon
                return (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/20 rounded-lg">
                          <Icon className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{milestone.title}</h3>
                          <p className="text-sm text-white/60">Target: {milestone.target}</p>
                        </div>
                      </div>
                      <span className="text-amber-400 font-bold">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${milestone.progress}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full h-full"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold">{event.title}</h4>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        event.type === 'study' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : event.type === 'interview'
                          ? 'bg-pink-500/20 text-pink-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>📅 {event.date}</span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        🕐 {event.time}
                      </span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.duration}
                      </span>
                    </div>
                  </div>
                  <button className={`px-6 py-2 rounded-lg transition-all ${
                    event.completed
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}>
                    {event.completed ? 'Done' : 'Mark Done'}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid md:grid-cols-3 gap-4"
          >
            {[
              { label: "Total Events", value: "12", icon: Calendar },
              { label: "Completed", value: "8", icon: CheckCircle },
              { label: "Study Hours", value: "24.5", icon: Clock },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">{stat.label}</span>
                    <Icon className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
