"use client"

import { useState, useCallback } from "react"
import { Sidebar, AnalysisItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// Mock data for previous analyses
const mockAnalyses: AnalysisItem[] = [
  { id: "1", role: "Senior Frontend Engineer", company: "Stripe", date: "Jan 28, 2026", readinessScore: 85 },
  { id: "2", role: "Full Stack Developer", company: "Vercel", date: "Jan 27, 2026", readinessScore: 72 },
  { id: "3", role: "Software Engineer", company: "Linear", date: "Jan 25, 2026", readinessScore: 91 },
  { id: "4", role: "Frontend Developer", company: "Notion", date: "Jan 20, 2026", readinessScore: 68 },
  { id: "5", role: "React Developer", company: "Figma", date: "Jan 15, 2026", readinessScore: 77 },
  { id: "6", role: "Staff Engineer", company: "OpenAI", date: "Jan 10, 2026", readinessScore: 45 },
  { id: "7", role: "Backend Engineer", company: "Supabase", date: "Dec 28, 2025", readinessScore: 62 },
  { id: "8", role: "Platform Engineer", company: "Railway", date: "Dec 15, 2025", readinessScore: 88 },
]

interface AppShellProps {
  children: React.ReactNode
  navbar?: React.ReactNode
}

export function AppShell({ children, navbar }: AppShellProps) {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null)

  const handleSelectAnalysis = useCallback((id: string) => {
    setSelectedAnalysisId(id)
    // In a real app, this would trigger loading the analysis data
    console.log("Selected analysis:", id)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        analyses={mockAnalyses}
        selectedId={selectedAnalysisId}
        onSelect={handleSelectAnalysis}
      />

      {/* Main content area */}
      <div className={cn(
        "min-h-screen transition-all duration-300",
        "md:ml-[60px]" // Space for collapsed sidebar on desktop
      )}>
        {/* Navbar */}
        {navbar}

        {/* Main content */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  )
}
