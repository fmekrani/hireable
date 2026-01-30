"use client"

import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import React, { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface GlowingEffectProps {
  blur?: number
  inactiveZone?: number
  proximity?: number
  spread?: number
  variant?: "default" | "white"
  glow?: boolean
  className?: string
  disabled?: boolean
  movementDuration?: number
  borderWidth?: number
}

export const GlowingEffect = ({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 0,
  spread = 20,
  variant = "default",
  glow = false,
  className,
  movementDuration = 2,
  borderWidth = 1,
  disabled = false,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPosition = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>(0)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || disabled) return

      animationFrameRef.current = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const distanceX = Math.abs(x - centerX) / centerX
        const distanceY = Math.abs(y - centerY) / centerY
        const distance = Math.max(distanceX, distanceY)

        if (distance < inactiveZone) {
          lastPosition.current = { x, y }
          mouseX.set(x)
          mouseY.set(y)
        }
      })
    },
    [mouseX, mouseY, inactiveZone, disabled]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-100)
    mouseY.set(-100)
  }, [mouseX, mouseY])

  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handleMouseMove, handleMouseLeave, disabled])

  const gradientColors =
    variant === "white"
      ? `rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6), transparent`
      : `rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.6), rgba(139, 92, 246, 0.3), transparent`

  const background = useMotionTemplate`radial-gradient(${spread}px circle at ${mouseX}px ${mouseY}px, ${gradientColors})`

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        glow && "opacity-100",
        className
      )}
      style={{
        background,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    />
  )
}

interface GlowingCardProps {
  children: React.ReactNode
  className?: string
  glowClassName?: string
}

export function GlowingCard({ children, className, glowClassName }: GlowingCardProps) {
  return (
    <div className={cn("group relative", className)}>
      <GlowingEffect
        spread={40}
        glow={false}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
        className={glowClassName}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
