"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedGradientText({ children, className, delay = 0 }: AnimatedGradientTextProps) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={cn(
        "inline-block bg-gradient-to-r from-white via-purple-200 to-violet-400 bg-clip-text text-transparent",
        "animate-gradient bg-[length:200%_auto]",
        className
      )}
      style={{
        backgroundSize: "200% auto",
        animation: "gradient 8s linear infinite",
      }}
    >
      {children}
    </motion.span>
  )
}

interface GlowingTextProps {
  children: React.ReactNode
  className?: string
}

export function GlowingText({ children, className }: GlowingTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block",
        className
      )}
    >
      {/* Glow layer */}
      <span 
        className="absolute inset-0 blur-2xl opacity-50 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
        aria-hidden="true"
      >
        {children}
      </span>
      {/* Main text */}
      <span className="relative bg-gradient-to-r from-white via-purple-100 to-violet-300 bg-clip-text text-transparent">
        {children}
      </span>
    </span>
  )
}
