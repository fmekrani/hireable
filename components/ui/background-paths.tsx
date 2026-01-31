"use client"

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"
import React, { useRef } from "react"

function FloatingPaths({ position, reducedMotion }: { position: number; reducedMotion: boolean }) {
  // Reduced number of paths for better performance (24 instead of 48)
  const paths = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 10 * position} -${189 + i * 12}C-${
      380 - i * 10 * position
    } -${189 + i * 12} -${312 - i * 10 * position} ${216 - i * 12} ${
      152 - i * 10 * position
    } ${343 - i * 12}C${616 - i * 10 * position} ${470 - i * 12} ${
      684 - i * 10 * position
    } ${875 - i * 12} ${684 - i * 10 * position} ${875 - i * 12}`,
    // Lower opacity values
    color: i % 3 === 0 
      ? `rgba(168, 85, 247, ${0.04 + i * 0.008})` // purple - reduced opacity
      : i % 3 === 1 
        ? `rgba(139, 92, 246, ${0.03 + i * 0.006})` // violet - reduced opacity
        : `rgba(99, 102, 241, ${0.025 + i * 0.005})`, // indigo - reduced opacity
    width: 0.6 + i * 0.03,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background decoration</title>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeOpacity={0.6}
            filter="url(#glow)"
            initial={{ pathLength: 0.3, opacity: 0.2 }}
            animate={reducedMotion ? {
              pathLength: 1,
              opacity: 0.3,
            } : {
              pathLength: 1,
              opacity: [0.2, 0.5, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={reducedMotion ? {
              duration: 0,
            } : {
              duration: 40 + Math.random() * 20, // Slower animation (40-60s)
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

interface BackgroundPathsProps {
  children?: React.ReactNode
  subtle?: boolean // For dashboard pages
}

export function BackgroundPaths({ children, subtle = false }: BackgroundPathsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const reducedMotion = prefersReducedMotion ?? false

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const pathsY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : 100])
  const pathsOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.2])

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Deep background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      
      {/* Radial gradient overlay - reduced intensity for subtle mode */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,${subtle ? '0.08' : '0.12'})_0%,_transparent_70%)]`} />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_70%,_rgba(0,0,0,0.6)_100%)]" />

      {/* Animated paths with parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: reducedMotion ? 0 : pathsY, opacity: pathsOpacity }}
      >
        <FloatingPaths position={1} reducedMotion={reducedMotion} />
        <FloatingPaths position={-1} reducedMotion={reducedMotion} />
      </motion.div>

      {/* Extra glow orbs - reduced for subtle mode */}
      {!subtle && (
        <>
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-600/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px]" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  )
}
