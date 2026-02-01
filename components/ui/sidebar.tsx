"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Menu,
  X,
  FileText,
  Briefcase
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface AnalysisItem {
  id: string
  role: string
  company: string
  date: string
  readinessScore: number
}

interface SidebarProps {
  analyses: AnalysisItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  className?: string
}

// Group analyses by time period
function groupAnalysesByTime(analyses: AnalysisItem[]) {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  return {
    thisWeek: analyses.filter((a) => new Date(a.date) >= oneWeekAgo),
    thisMonth: analyses.filter(
      (a) => new Date(a.date) >= oneMonthAgo && new Date(a.date) < oneWeekAgo
    ),
    older: analyses.filter((a) => new Date(a.date) < oneMonthAgo),
  }
}

function ReadinessPill({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    if (score >= 60) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  return (
    <span className={cn(
      "inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full border",
      getColor()
    )}>
      {score}
    </span>
  )
}

interface CollapsibleGroupProps {
  title: string
  items: AnalysisItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  defaultOpen?: boolean
  isExpanded: boolean
}

function CollapsibleGroup({ 
  title, 
  items, 
  selectedId, 
  onSelect, 
  defaultOpen = true,
  isExpanded 
}: CollapsibleGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (items.length === 0) return null

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors",
          !isExpanded && "justify-center"
        )}
      >
        {isExpanded ? (
          <>
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>{title}</span>
            <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
              {items.length}
            </span>
          </>
        ) : (
          <div className="w-1 h-1 rounded-full bg-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 px-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all duration-200 group",
                    selectedId === item.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted border border-transparent hover:border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.role}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.company}
                      </p>
                    </div>
                    <ReadinessPill score={item.readinessScore} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.date}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Sidebar({ analyses, selectedId, onSelect, className }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const filteredAnalyses = analyses.filter(
    (a) =>
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = groupAnalysesByTime(filteredAnalyses)

  // Desktop sidebar
  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-border flex items-center gap-3",
        !isExpanded && !isMobile && "justify-center"
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-primary" />
        </div>
        {(isExpanded || isMobile) && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden"
          >
            <h2 className="text-sm font-bold text-foreground whitespace-nowrap">
              Previous Analyses
            </h2>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {analyses.length} total
            </p>
          </motion.div>
        )}
      </div>

      {/* Search */}
      {(isExpanded || isMobile) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3 border-b border-border"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </motion.div>
      )}

      {/* Collapsible groups */}
      <div className="flex-1 relative overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <CollapsibleGroup
          title="This Week"
          items={grouped.thisWeek}
          selectedId={selectedId}
          onSelect={onSelect}
          defaultOpen={true}
          isExpanded={isExpanded || isMobile}
        />
        <CollapsibleGroup
          title="This Month"
          items={grouped.thisMonth}
          selectedId={selectedId}
          onSelect={onSelect}
          defaultOpen={true}
          isExpanded={isExpanded || isMobile}
        />
        <CollapsibleGroup
          title="Older"
          items={grouped.older}
          selectedId={selectedId}
          onSelect={onSelect}
          defaultOpen={false}
          isExpanded={isExpanded || isMobile}
        />

        {/* Empty state for collapsed sidebar */}
        {!isExpanded && !isMobile && (
          <div className="px-2 space-y-2">
            {analyses.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "w-full p-2 rounded-lg flex items-center justify-center transition-all",
                  selectedId === item.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                )}
                title={`${item.role} at ${item.company}`}
              >
                <ReadinessPill score={item.readinessScore} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // Mobile: slide-in overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile toggle button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-20 left-4 z-40 p-2 bg-card border border-border rounded-lg shadow-lg md:hidden"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 md:hidden"
                onClick={() => setIsMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border z-50 md:hidden"
              >
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Desktop: hover-expand sidebar
  return (
    <motion.aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      animate={{ width: isExpanded ? 300 : 60 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={cn(
        "hidden md:flex flex-col h-screen bg-card/80 backdrop-blur-xl border-r border-border fixed left-0 top-0 z-30",
        className
      )}
    >
      {sidebarContent}
    </motion.aside>
  )
}
