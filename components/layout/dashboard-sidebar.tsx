'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Calendar, 
  Mic, 
  MessageCircle, 
  FileText, 
  Clock,
  ChevronRight,
  Home,
  Settings,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mainNav = [
  { href: '/analysis', label: 'Job Analysis', icon: Zap, badge: null },
  { href: '/calendar', label: 'Study Calendar', icon: Calendar, badge: null },
  { href: '/mock-interview', label: 'Mock Interviews', icon: Mic, badge: '3' },
  { href: '#', label: 'AI Coach', icon: MessageCircle, badge: 'New' },
]

const recentAnalyses = [
  { title: 'Senior Frontend Engineer', company: 'Google', date: '2 days ago' },
  { title: 'Full Stack Developer', company: 'Stripe', date: '1 week ago' },
  { title: 'Software Engineer', company: 'Meta', date: '2 weeks ago' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
          </div>
          <span className="text-xl font-bold text-white">
            Hireable<span className="text-violet-400">.ai</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          {mainNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-violet-500/10 text-white" 
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                    isActive 
                      ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30" 
                      : "bg-white/5 group-hover:bg-white/10"
                  )}>
                    <item.icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-white" : "text-white/60"
                    )} />
                  </div>
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-semibold rounded-full",
                      item.badge === 'New' 
                        ? "bg-violet-500/20 text-violet-400" 
                        : "bg-white/10 text-white/60"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>

        {/* Recent Analyses */}
        <div>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-3">
            Recent Analyses
          </p>
          <div className="space-y-1">
            {recentAnalyses.map((analysis, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 2 }}
                className="w-full group flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/70 group-hover:text-white truncate transition-colors">
                    {analysis.title}
                  </p>
                  <p className="text-xs text-white/30">
                    {analysis.company} • {analysis.date}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 flex-shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-all" />
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex-1">
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </motion.div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="mt-4 flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-white/40">Free Plan</p>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>
    </aside>
  )
}
