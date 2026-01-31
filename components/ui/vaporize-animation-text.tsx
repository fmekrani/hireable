"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

interface VaporizeAnimationTextProps {
  texts: string[]
  onComplete?: () => void
}

export function VaporizeAnimationText({ texts, onComplete }: VaporizeAnimationTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showText, setShowText] = useState(true)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>(0)
  const textRef = useRef<HTMLDivElement>(null)

  const createParticles = useCallback((element: HTMLElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = element.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    const particles: Particle[] = []
    const density = 3
    const colors = ["#8b5cf6", "#a855f7", "#c084fc", "#e879f9", "#7c3aed"]

    for (let x = 0; x < rect.width; x += density) {
      for (let y = 0; y < rect.height; y += density) {
        if (Math.random() > 0.3) {
          particles.push({
            x: rect.left - containerRect.left + x,
            y: rect.top - containerRect.top + y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 6 - 2,
            life: 1,
            maxLife: Math.random() * 60 + 40,
            size: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
          })
        }
      }
    }

    particlesRef.current = particles
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const particles = particlesRef.current
    let activeParticles = 0

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      if (p.life <= 0) continue

      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05
      p.vx *= 0.99
      p.life -= 1 / p.maxLife

      if (p.life > 0) {
        activeParticles++
        ctx.globalAlpha = p.life * 0.8
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (activeParticles > 0) {
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      setIsAnimating(false)
      if (currentIndex < texts.length - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1)
          setShowText(true)
        }, 200)
      } else {
        onComplete?.()
      }
    }
  }, [currentIndex, texts.length, onComplete])

  const startVaporize = useCallback(() => {
    if (isAnimating || !textRef.current) return

    setIsAnimating(true)
    createParticles(textRef.current)

    setTimeout(() => {
      setShowText(false)
      animate()
    }, 100)
  }, [isAnimating, createParticles, animate])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (showText && textRef.current) {
      const timer = setTimeout(() => {
        startVaporize()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showText, currentIndex, startVaporize])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      <AnimatePresence mode="wait">
        {showText && (
          <motion.div
            key={currentIndex}
            ref={textRef}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(5px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent"
          >
            {texts[currentIndex]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
