"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function MouseGlow() {
  const [isVisible, setIsVisible] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 40, stiffness: 90, mass: 0.5 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.body.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.body.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [mouseX, mouseY, isVisible])

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2"
        style={{ x, y }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 bg-gradient-radial from-violet-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        {/* Inner glow */}
        <div className="absolute inset-[100px] bg-gradient-radial from-fuchsia-500/15 via-violet-500/5 to-transparent rounded-full blur-2xl" />
        {/* Core */}
        <div className="absolute inset-[200px] bg-gradient-radial from-purple-400/10 to-transparent rounded-full blur-xl" />
      </motion.div>
    </motion.div>
  )
}

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top right orb */}
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] will-change-transform"
        animate={{
          x: [0, 20, 0],
          y: [0, -15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
      >
        <div className="w-full h-full bg-gradient-radial from-violet-600/30 via-purple-900/10 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Bottom left orb */}
      <motion.div
        className="absolute -bottom-60 -left-40 w-[800px] h-[800px] will-change-transform"
        animate={{
          x: [0, -25, 0],
          y: [0, 20, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
      >
        <div className="w-full h-full bg-gradient-radial from-fuchsia-600/20 via-purple-900/10 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Center orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-radial from-indigo-600/10 via-transparent to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Accent orb */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-[400px] h-[400px]"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-radial from-blue-500/15 via-transparent to-transparent rounded-full blur-2xl" />
      </motion.div>
    </div>
  )
}
