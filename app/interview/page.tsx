'use client'

import { motion } from 'framer-motion'
import { LimelightNav } from '@/components/ui/limelight-nav-new'
import { ProfileDropdown } from '@/components/ui/profile-dropdown'
import { Video, Home, BarChart3, Calendar, Sparkles, ArrowRight, Clock, Users, Mic, CheckCircle } from 'lucide-react'

const navItems = [
  { id: "home", icon: <Home />, label: "Home", href: "/" },
  { id: "analysis", icon: <BarChart3 />, label: "Analysis", href: "/analysis" },
  { id: "interview", icon: <Video />, label: "Interview", href: "/interview" },
  { id: "calendar", icon: <Calendar />, label: "Calendar", href: "/calendar" },
]

const upcomingInterviews = [
  { title: "Technical Round", company: "Google", date: "Feb 5, 2024", time: "2:00 PM", duration: "60 min" },
  { title: "System Design", company: "Amazon", date: "Feb 8, 2024", time: "3:30 PM", duration: "90 min" },
  { title: "Behavioral Round", company: "Meta", date: "Feb 12, 2024", time: "1:00 PM", duration: "45 min" },
]

export default function InterviewPage() {
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">AI Interviewer</h1>
                <p className="text-white/60">Practice and prepare for your upcoming interviews</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-xl rounded-2xl border border-pink-500/30 p-8 mb-12 hover:border-pink-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Start AI Interview</h3>
                <p className="text-white/60">Get AI-powered feedback on your interview skills</p>
              </div>
              <Sparkles className="w-8 h-8 text-pink-400" />
            </div>
            <button className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all flex items-center gap-2">
              Begin Interview
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Interview Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Interview Types</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Technical Round", description: "Coding & algorithms", icon: Mic },
                { title: "System Design", description: "Architecture & design", icon: CheckCircle },
                { title: "Behavioral", description: "Soft skills & culture fit", icon: Users },
              ].map((type, i) => {
                const Icon = type.icon
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{type.title}</h3>
                        <p className="text-sm text-white/60">{type.description}</p>
                      </div>
                      <Icon className="w-5 h-5 text-white/40" />
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
                      Start
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Upcoming Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Interviews</h2>
            <div className="space-y-4">
              {upcomingInterviews.map((interview, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold">{interview.title}</h4>
                      <span className="text-xs bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full">{interview.company}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        📅 {interview.date}
                      </span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        🕐 {interview.time}
                      </span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {interview.duration}
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-all">
                    Prepare
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-4 mt-12"
          >
            {[
              { label: "Interviews Completed", value: "5", icon: CheckCircle },
              { label: "Average Score", value: "7.8/10", icon: Sparkles },
              { label: "Next Interview", value: "In 3 days", icon: Calendar },
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
