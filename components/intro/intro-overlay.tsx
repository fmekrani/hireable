"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface IntroOverlayProps {
  children: React.ReactNode
}

export function IntroOverlay({ children }: IntroOverlayProps) {
  const [showIntro, setShowIntro] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const [showWaitlist, setShowWaitlist] = useState(false)

  useEffect(() => {
    // Check if intro has already been shown this session
    const hasSeenIntro = sessionStorage.getItem("hireable-intro-seen")
    
    if (!hasSeenIntro) {
      setShowIntro(true)
    } else {
      setIntroComplete(true)
    }
  }, [])

  const handleIntroComplete = () => {
    // Show waitlist text after hireable.ai animation
    setShowWaitlist(true)
    
    // After waitlist animation, fade out and start homepage fade-in
    setTimeout(() => {
      sessionStorage.setItem("hireable-intro-seen", "true")
      setIntroComplete(true)
      setTimeout(() => {
        setShowIntro(false)
      }, 200)
    }, 2200) // Show waitlist for 2.2 seconds
  }

  return (
    <>
      {/* Intro Overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
          >
            {/* Background with premium gradient */}
            <div className="absolute inset-0 bg-black">
              {/* Radial gradient vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_70%,_rgba(0,0,0,0.8)_100%)]" />
              
              {/* Subtle purple glow in center */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15)_0%,_transparent_50%)]" />
              
              {/* Animated grain texture */}
              <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Vaporize Animation */}
            <div className="relative z-10 w-full h-full">
              
              {/* Waitlist text animation */}
              <AnimatePresence>
                {showWaitlist && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.8, 
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.p
                        initial={{ opacity: 0, letterSpacing: "0.3em" }}
                        animate={{ opacity: 1, letterSpacing: "0.15em" }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-sm md:text-base uppercase tracking-[0.15em] text-violet-400/80 font-medium"
                      >
                        Waitlist opens
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: 0.4,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent"
                      >
                        May 2026
                      </motion.p>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </>
  )
}
