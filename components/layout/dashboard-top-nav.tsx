'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Calendar, Mic } from 'lucide-react'
import { ExpandableTabs } from '@/components/ui/expandable-tabs'

const tabs = [
  { id: 'analysis', label: 'Job Analysis', icon: Zap, href: '/analysis' },
  { id: 'calendar', label: 'Study Calendar', icon: Calendar, href: '/calendar' },
  { id: 'mock-interview', label: 'Mock Interviews', icon: Mic, href: '/mock-interview' },
]

export function DashboardTopNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
          </div>
          <span className="text-lg font-bold text-white hidden sm:block">
            Hireable<span className="text-violet-400">.ai</span>
          </span>
        </Link>

        {/* Expandable Tabs */}
        <ExpandableTabs tabs={tabs} />

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <button className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full opacity-0 group-hover:opacity-70 blur transition-opacity duration-300" />
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center border border-white/10">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
          </button>
        </div>
      </div>
    </motion.header>
  )
}
