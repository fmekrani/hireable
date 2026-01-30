"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingHeaderProps {
  className?: string
}

export function FloatingHeader({ className }: FloatingHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 pointer-events-none",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Brand */}
        <Link 
          href="/" 
          className="pointer-events-auto group flex items-center gap-2"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Logo container */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-lg">H</span>
            </div>
          </motion.div>
          
          <span className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Hireable<span className="text-violet-400">.ai</span>
          </span>
        </Link>

        {/* Profile Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="pointer-events-auto relative group"
        >
          {/* Glow ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full opacity-0 group-hover:opacity-70 blur transition-opacity duration-500" />
          
          {/* Button */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg group-hover:border-violet-500/50 transition-all duration-400">
            <User className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors duration-400" />
          </div>
          
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
        </motion.button>
      </div>
    </motion.header>
  )
}
