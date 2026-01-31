"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { ArrowRight, Mic, Sparkles, Zap, BookOpen, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

// Animated CTA Button with glow
function GlowButton({ 
  children, 
  onClick, 
  variant = "primary",
  className 
}: { 
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "ghost"
  className?: string
}) {
  if (variant === "ghost") {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "group relative px-8 py-4 rounded-xl font-semibold text-white/80 transition-all duration-300",
          "border border-white/10 hover:border-white/20 hover:bg-white/5",
          "backdrop-blur-sm",
          className
        )}
      >
        {children}
      </motion.button>
    )
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative px-8 py-4 rounded-xl font-semibold text-white transition-all duration-500 ease-out",
        className
      )}
    >
      {/* Animated glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-xl opacity-70 group-hover:opacity-100 blur-lg transition-all duration-500 ease-out group-hover:blur-xl animate-pulse-slow" />
      
      {/* Button background */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      {/* Content */}
      <span className="relative flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

// Feature pill with glow
function FeaturePill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      
      <div className="relative flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 group-hover:border-violet-500/30 transition-colors">
        <Icon className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
    </motion.div>
  )
}

interface CinematicHeroProps {
  className?: string
}

export function CinematicHero({ className }: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <motion.div
      ref={containerRef}
      style={{ opacity }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24"
    >
      <motion.div
        style={{ y }}
        className="text-center max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">AI-Powered Career Prep</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
        >
          <span className="block">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Job Prep,
            </span>
          </span>
          <span className="block mt-2">
            <span 
              className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
              style={{
                animation: "gradient 6s linear infinite",
              }}
            >
              but actually personal.
            </span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-white/50 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Upload a job post + resume. Get <span className="text-white/80">skill gaps</span>, 
          <span className="text-white/80"> learning plan</span>, and 
          <span className="text-white/80"> timeline</span>. Land your dream role faster.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/analysis">
            <GlowButton>
              <Zap className="w-5 h-5" />
              Start Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </GlowButton>
          </Link>
          
          <Link href="/mock-interview">
            <GlowButton variant="ghost">
              <Mic className="w-5 h-5" />
              Practice Interview
            </GlowButton>
          </Link>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <FeaturePill icon={Zap} label="Skill Gap Analysis" />
          <FeaturePill icon={BookOpen} label="Learning Resources" />
          <FeaturePill icon={Clock} label="Study Timeline" />
          <FeaturePill icon={Mic} label="Mock Interviews" />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ height: ["20%", "80%", "20%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 bg-white/40 rounded-full"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
