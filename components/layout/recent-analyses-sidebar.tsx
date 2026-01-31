'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  ChevronRight,
  ChevronLeft,
  Clock,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const recentAnalyses = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Google', date: '2 days ago' },
  { id: 2, title: 'Full Stack Developer', company: 'Stripe', date: '1 week ago' },
  { id: 3, title: 'Software Engineer', company: 'Meta', date: '2 weeks ago' },
  { id: 4, title: 'Backend Engineer', company: 'Amazon', date: '3 weeks ago' },
  { id: 5, title: 'DevOps Engineer', company: 'Netflix', date: '1 month ago' },
]

interface RecentAnalysesSidebarProps {
  className?: string
}

export function RecentAnalysesSidebar({ className }: RecentAnalysesSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-[72px] bottom-0 bg-zinc-950/60 backdrop-blur-xl border-r border-white/5 z-30 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/70">Recent Analyses</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white/70",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Recent Analyses List */}
      <div className="flex-1 relative overflow-y-auto p-2 scroll-smooth">
        <div className="space-y-1">
          {recentAnalyses.map((analysis) => (
            <motion.button
              key={analysis.id}
              whileHover={{ x: isCollapsed ? 0 : 2 }}
              className={cn(
                "w-full group flex items-center gap-3 rounded-xl text-left hover:bg-white/5 transition-all",
                isCollapsed ? "p-2 justify-center" : "px-3 py-2.5"
              )}
              title={isCollapsed ? `${analysis.title} - ${analysis.company}` : undefined}
            >
              {/* Icon */}
              <div className={cn(
                "flex items-center justify-center flex-shrink-0 rounded-lg bg-white/5 group-hover:bg-violet-500/20 transition-colors",
                isCollapsed ? "w-10 h-10" : "w-9 h-9"
              )}>
                <FileText className={cn(
                  "text-white/40 group-hover:text-violet-400 transition-colors",
                  isCollapsed ? "w-5 h-5" : "w-4 h-4"
                )} />
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 min-w-0 overflow-hidden"
                  >
                    <p className="text-sm font-medium text-white/70 group-hover:text-white truncate transition-colors">
                      {analysis.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-white/30">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{analysis.company}</span>
                      <span>•</span>
                      <span className="flex-shrink-0">{analysis.date}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Arrow */}
              {!isCollapsed && (
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer hint when collapsed */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-2 border-t border-white/5"
          >
            <div className="text-center">
              <span className="text-[10px] text-white/20">{recentAnalyses.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
