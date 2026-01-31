"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Zap,
  BookOpen,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  Target,
  Wrench,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GlowingCard } from "@/components/ui/glowing-effect"

// Types
export interface JobResult {
  skills: string[]
  missingSkills?: { skill: string; priority: "high" | "medium" | "low" }[]
  resources: { skill: string; links: string[] }[]
  timeline: { skill: string; weeks: number }[]
  readinessScore?: number
}

// Skill category type
type SkillCategory = { label: string; color: string; icon: LucideIcon }

// Skill category mapping
const skillCategories: Record<string, SkillCategory> = {
  React: { label: "Core", color: "bg-primary/10 text-primary border-primary/20", icon: Target },
  TypeScript: { label: "Core", color: "bg-primary/10 text-primary border-primary/20", icon: Target },
  JavaScript: { label: "Core", color: "bg-primary/10 text-primary border-primary/20", icon: Target },
  Python: { label: "Core", color: "bg-primary/10 text-primary border-primary/20", icon: Target },
  "Node.js": { label: "Tools", color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: Wrench },
  GraphQL: { label: "Tools", color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: Wrench },
  PostgreSQL: { label: "Tools", color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: Wrench },
  AWS: { label: "Tools", color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: Wrench },
  Docker: { label: "Tools", color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: Wrench },
  "System Design": { label: "Concepts", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Lightbulb },
}

const defaultSkillCategory: SkillCategory = {
  label: "Skill",
  color: "bg-muted text-muted-foreground border-border",
  icon: Zap,
}

function getSkillCategory(skill: string): SkillCategory {
  return skillCategories[skill] || defaultSkillCategory
}

const priorityColors = {
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
}

// Progress Ring Component
function ProgressRing({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const getColor = () => {
    if (progress >= 80) return "#22c55e" // emerald
    if (progress >= 60) return "#8b5cf6" // purple
    return "#f59e0b" // amber
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 8px ${getColor()}50)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-3xl font-bold text-foreground"
        >
          {progress}
        </motion.span>
        <span className="text-xs text-muted-foreground">Readiness</span>
      </div>
    </div>
  )
}

// Loading skeleton
function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-6"
        >
          <div className="h-6 w-32 bg-muted rounded-lg mb-4 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-10 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface ResultsCardsProps {
  results: JobResult | null
  isLoading: boolean
}

export function ResultsCards({ results, isLoading }: ResultsCardsProps) {
  if (isLoading) {
    return <ResultsSkeleton />
  }

  if (!results) return null

  const totalWeeks = results.timeline.reduce((sum, item) => sum + item.weeks, 0)
  const readinessScore = results.readinessScore || 75

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Readiness Score Card */}
      <motion.div variants={cardVariants}>
        <GlowingCard className="rounded-2xl h-full">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Readiness Score</h3>
                <p className="text-xs text-muted-foreground">Your job fit analysis</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ProgressRing progress={readinessScore} size={140} strokeWidth={10} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-lg font-bold text-foreground">{results.skills.length}</p>
                <p className="text-xs text-muted-foreground">Matched</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-lg font-bold text-foreground">{results.missingSkills?.length || 3}</p>
                <p className="text-xs text-muted-foreground">Gaps</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-lg font-bold text-foreground">{totalWeeks}w</p>
                <p className="text-xs text-muted-foreground">Prep Time</p>
              </div>
            </div>
          </div>
        </GlowingCard>
      </motion.div>

      {/* Matched Skills Card */}
      <motion.div variants={cardVariants}>
        <GlowingCard className="rounded-2xl h-full">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Matched Skills</h3>
                <p className="text-xs text-muted-foreground">Skills you already have</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {results.skills.map((skill, idx) => {
                const category = getSkillCategory(skill)
                const IconComponent = category.icon
                return (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 cursor-default",
                      category.color
                    )}
                  >
                    <IconComponent className="w-3 h-3" />
                    {skill}
                  </motion.span>
                )
              })}
            </div>
          </div>
        </GlowingCard>
      </motion.div>

      {/* Missing Skills Card */}
      <motion.div variants={cardVariants}>
        <GlowingCard className="rounded-2xl h-full">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Skill Gaps</h3>
                <p className="text-xs text-muted-foreground">Skills to develop</p>
              </div>
            </div>
            <div className="space-y-2">
              {(results.missingSkills || [
                { skill: "System Design", priority: "high" as const },
                { skill: "GraphQL", priority: "medium" as const },
                { skill: "Docker", priority: "low" as const },
              ]).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border",
                    priorityColors[item.priority]
                  )}
                >
                  <span className="text-sm font-medium">{item.skill}</span>
                  <span className="text-xs uppercase font-semibold opacity-70">
                    {item.priority}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </GlowingCard>
      </motion.div>

      {/* Timeline Card */}
      <motion.div variants={cardVariants}>
        <GlowingCard className="rounded-2xl h-full">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Learning Timeline</h3>
                <p className="text-xs text-muted-foreground">Estimated prep time per skill</p>
              </div>
            </div>
            <div className="mb-4 p-3 bg-gradient-to-r from-teal-500/10 to-primary/10 rounded-xl border border-teal-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Prep Time</span>
                <span className="text-xl font-bold text-primary">{totalWeeks} weeks</span>
              </div>
            </div>
            <div className="space-y-3">
              {results.timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{item.skill}</p>
                      <span className="text-xs font-semibold text-muted-foreground ml-2">
                        {item.weeks}w
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(item.weeks * 20, 100)}%` }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlowingCard>
      </motion.div>

      {/* Resources Card - Full width */}
      <motion.div variants={cardVariants} className="lg:col-span-2">
        <GlowingCard className="rounded-2xl">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Learning Resources</h3>
                <p className="text-xs text-muted-foreground">Curated materials for skill development</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.resources.slice(0, 4).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/30 transition-colors group"
                >
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                    {item.skill}
                  </p>
                  <div className="space-y-2">
                    {item.links.map((link, linkIdx) => (
                      <div
                        key={linkIdx}
                        className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                      >
                        {linkIdx === 0 ? (
                          <Video className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        )}
                        <span className="truncate">{link}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlowingCard>
      </motion.div>
    </motion.div>
  )
}
