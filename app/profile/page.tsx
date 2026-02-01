"use client"

import { motion } from "framer-motion"
import { LimelightNav } from "@/components/ui/limelight-nav-new"
import { User, Mail, MapPin, Briefcase, Settings, LogOut, Edit2, Home, BarChart3, Video, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/supabase/auth-context"

export default function ProfilePage() {
  const { session, user, loading } = useAuth()
  const navItems = [
    { id: "home", icon: <Home />, label: "Home", href: "/" },
    { id: "analysis", icon: <BarChart3 />, label: "Analysis", href: "/analysis" },
    { id: "interview", icon: <Video />, label: "Interview", href: "/interview" },
    { id: "calendar", icon: <Calendar />, label: "Calendar", href: "/calendar" },
    { id: "profile", icon: <User />, label: "Profile", href: "/profile" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-white/70">You need to sign in to view your profile.</p>
        <Link
          href="/sign-in"
          className="px-6 py-3 rounded-lg bg-white text-black font-semibold"
        >
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black/80 text-white overflow-x-hidden">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
          <LimelightNav items={navItems} />
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
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Your Profile</h1>
            <p className="text-lg text-white/60">Manage your account and career development</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-1 mb-6">
                  <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-1">{user?.full_name || "User"}</h2>
                <p className="text-white/60 mb-6">{user?.full_name ? "Career Member" : "Member"}</p>
                <div className="w-full space-y-3">
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300">
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
            >
              <h3 className="text-xl font-bold mb-6">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Email</label>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                    <Mail className="w-5 h-5 text-white/60" />
                    <span className="text-white">{session.user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Location</label>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                    <MapPin className="w-5 h-5 text-white/60" />
                    <span className="text-white">San Francisco, CA</span>
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Role</label>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                    <Briefcase className="w-5 h-5 text-white/60" />
                    <span className="text-white">Full Stack Developer</span>
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Experience</label>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/10">
                    <span className="text-white">5+ years</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { label: "Job Analyses", value: "12", icon: BarChart3 },
              { label: "Mock Interviews", value: "8", icon: Video },
              { label: "Calendar Events", value: "24", icon: Calendar },
              { label: "Profile Strength", value: "85%", icon: User },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/60 text-sm">{stat.label}</span>
                    <Icon className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12 hover:bg-white/10 transition-all duration-300"
          >
            <h3 className="text-2xl font-bold mb-6">Technical Skills</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {["React", "TypeScript", "Node.js", "PostgreSQL", "Python", "Docker", "AWS", "GraphQL", "Next.js"].map((skill, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-white/5 to-white/10 border border-white/20 rounded-lg p-4 text-center hover:border-white/40 transition-all duration-300"
                >
                  <span className="text-white font-medium">{skill}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
          >
            <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { activity: "Analyzed Google SWE position", time: "2 hours ago", icon: BarChart3 },
                { activity: "Completed mock interview", time: "1 day ago", icon: Video },
                { activity: "Updated resume", time: "3 days ago", icon: Edit2 },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={i}
                    whileHover={{ x: 8 }}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="p-3 bg-white/10 rounded-lg">
                      <Icon className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.activity}</p>
                      <p className="text-white/60 text-sm">{item.time}</p>
                    </div>
                    <span className="text-white/40">→</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex justify-center"
          >
            <button className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/50 rounded-lg flex items-center gap-2 transition-all duration-300">
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
