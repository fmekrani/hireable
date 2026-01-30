'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Sparkles, Menu, X, Calendar, Mic, FileText, History, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Resume Analysis', icon: FileText },
  { href: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
]

interface NavbarProps {
  onNewAnalysis?: () => void
  onViewHistory?: () => void
  transparent?: boolean
}

export default function Navbar({ onNewAnalysis, onViewHistory, transparent = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      transparent 
        ? "bg-transparent" 
        : "bg-card/80 backdrop-blur-xl border-b border-border shadow-sm"
    )}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">
              Hireable
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewHistory}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              View History
            </Button>
            <Button
              size="sm"
              onClick={onNewAnalysis}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border shadow-lg transition-all duration-300 overflow-hidden",
        mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:text-primary rounded-xl hover:bg-primary/10 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-center gap-2"
              onClick={() => { onViewHistory?.(); setMobileMenuOpen(false) }}
            >
              <History className="w-4 h-4" />
              View History
            </Button>
            <Button
              className="w-full justify-center gap-2"
              onClick={() => { onNewAnalysis?.(); setMobileMenuOpen(false) }}
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
