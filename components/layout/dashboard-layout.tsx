'use client'

import { ReactNode, useState, useEffect } from 'react'
import { DashboardTopNav } from './dashboard-top-nav'
import { RecentAnalysesSidebar } from './recent-analyses-sidebar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(280)

  // Listen to sidebar collapse state (could be enhanced with context)
  useEffect(() => {
    const checkSidebar = () => {
      const sidebar = document.querySelector('aside')
      if (sidebar) {
        setSidebarWidth(sidebar.getBoundingClientRect().width)
      }
    }
    
    const observer = new ResizeObserver(checkSidebar)
    const sidebar = document.querySelector('aside')
    if (sidebar) {
      observer.observe(sidebar)
    }
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-black to-fuchsia-950/10 pointer-events-none" />
      
      {/* Top Navigation */}
      <DashboardTopNav />

      {/* Sidebar */}
      <RecentAnalysesSidebar />

      {/* Main Content */}
      <main 
        className={cn(
          "relative min-h-screen pt-[72px] transition-all duration-300 ease-out",
          className
        )}
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top fade gradient */}
        <div 
          className="fixed top-[72px] right-0 h-24 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none transition-all duration-300" 
          style={{ left: sidebarWidth }}
        />
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </main>
    </div>
  )
}

