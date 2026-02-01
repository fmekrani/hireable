'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: LucideIcon
  href: string
}

interface ExpandableTabsProps {
  tabs: Tab[]
  className?: string
}

export function ExpandableTabs({ tabs, className }: ExpandableTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeTab = tabs.find(tab => pathname === tab.href)?.id || tabs[0]?.id

  const handleTabClick = (tab: Tab) => {
    router.push(tab.href)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const isHovered = hoveredId === tab.id
        const Icon = tab.icon

        return (
          <motion.button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            onMouseEnter={() => setHoveredId(tab.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200",
              isActive 
                ? "text-white" 
                : "text-white/50 hover:text-white/80"
            )}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Active/Hover background */}
            {(isActive || isHovered) && (
              <motion.div
                layoutId="tab-highlight"
                className={cn(
                  "absolute inset-0 rounded-xl",
                  isActive 
                    ? "bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80" 
                    : "bg-white/5"
                )}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            {/* Icon */}
            <span className="relative z-10">
              <Icon className="w-4 h-4" />
            </span>

            {/* Label - always visible but can animate */}
            <AnimatePresence mode="wait">
              <motion.span
                key={tab.id}
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: 1, 
                  width: "auto",
                }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 whitespace-nowrap overflow-hidden"
              >
                {tab.label}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}
