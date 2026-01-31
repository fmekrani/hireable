"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  delay?: number
}

export function GlassCard({ children, className, glowColor = "violet", delay = 0 }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), { stiffness: 200, damping: 40 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), { stiffness: 200, damping: 40 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const glowColors: Record<string, string> = {
    violet: "from-violet-600/50 via-fuchsia-600/50 to-violet-600/50",
    teal: "from-teal-500/50 via-cyan-500/50 to-teal-500/50",
    amber: "from-amber-500/50 via-orange-500/50 to-amber-500/50",
    blue: "from-blue-500/50 via-indigo-500/50 to-blue-500/50",
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative group",
        className
      )}
    >
      {/* Glow effect */}
      <motion.div
        className={cn(
          "absolute -inset-[1px] rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-500",
          glowColors[glowColor],
          isHovered && "opacity-60"
        )}
      />

      {/* Border gradient */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-white/10 opacity-50" />

      {/* Glass background */}
      <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden">
        {/* Inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
        
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

// Feature card with icon
interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  gradient?: string
  glowColor?: string
  delay?: number
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  gradient = "from-violet-600 to-fuchsia-600",
  glowColor = "violet",
  delay = 0 
}: FeatureCardProps) {
  const content = (
    <GlassCard glowColor={glowColor} delay={delay} className="h-full">
      <div className="p-8">
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-2xl",
            gradient
          )}
          style={{
            boxShadow: `0 20px 40px -15px ${glowColor === 'violet' ? 'rgba(139, 92, 246, 0.5)' : glowColor === 'teal' ? 'rgba(20, 184, 166, 0.5)' : 'rgba(251, 146, 60, 0.5)'}`,
          }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-200 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
          {description}
        </p>

        {/* Arrow indicator */}
        {href && (
          <motion.div 
            className="mt-6 flex items-center gap-2 text-violet-400 font-semibold"
            whileHover={{ x: 5 }}
          >
            <span>Get started</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.div>
        )}
      </div>
    </GlassCard>
  )

  if (href) {
    return (
      <a href={href} className="block h-full">
        {content}
      </a>
    )
  }

  return content
}
