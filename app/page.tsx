'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight,
  Zap,
  BookOpen,
  Clock,
  Mic,
  Calendar,
  Sparkles
} from 'lucide-react'
import { IntroOverlay } from '@/components/intro/intro-overlay'
import { BackgroundPaths } from '@/components/ui/background-paths'
import { FloatingHeader } from '@/components/ui/floating-header'
import { CinematicHero } from '@/components/ui/cinematic-hero'
import { GlassCard } from '@/components/ui/glass-card'
import { FloatingOrbs } from '@/components/ui/mouse-glow'
import { useAuth } from '@/lib/supabase/auth-context'

// Feature data
const features = [
  {
    icon: Zap,
    title: "Skill Gap Analysis",
    description: "AI identifies exactly which skills you need to develop for your target role.",
    gradient: "from-violet-600 to-fuchsia-600",
  },
  {
    icon: BookOpen,
    title: "Learning Resources",
    description: "Curated courses, tutorials, and materials tailored to your gaps.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Calendar,
    title: "Study Timeline",
    description: "Personalized roadmap with milestones to keep you on track.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Mic,
    title: "Mock Interviews",
    description: "Practice with AI-powered interviews tailored to your target company.",
    gradient: "from-rose-500 to-pink-500",
  },
]

const stats = [
  { value: "10K+", label: "Jobs Analyzed" },
  { value: "85%", label: "Success Rate" },
  { value: "2.5x", label: "Faster Prep" },
]

export default function Home() {
  const { session, user } = useAuth()

  return (
    <IntroOverlay>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* Floating orbs background */}
        <FloatingOrbs />
        
        {/* Floating header */}
        <FloatingHeader />

        {/* Hero Section with Background Paths */}
        <BackgroundPaths>
          <CinematicHero />
        </BackgroundPaths>

        {/* Features Section */}
        <section className="relative py-32 px-6">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/30 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.08)_0%,_transparent_60%)]" />

          <div className="relative max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-300">Features</span>
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Everything You Need to
                </span>{' '}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Land the Job
                </span>
              </h2>
              <p className="text-xl text-white/40 max-w-2xl mx-auto">
                From skill analysis to interview prep, we've got you covered.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <GlassCard>
                    <div className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-32 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/50 to-black" />
          
          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="text-xl text-white/40 max-w-2xl mx-auto">
                Three simple steps to interview readiness.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Paste Job URL", desc: "Drop in any job posting link from LinkedIn, Indeed, or company sites." },
                { step: "02", title: "Upload Resume", desc: "We analyze your experience against job requirements." },
                { step: "03", title: "Get Your Plan", desc: "Receive personalized gaps, resources, and a study timeline." },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="text-7xl font-bold text-violet-500/10 mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/40">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-20 px-6">
          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-8"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/40 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 px-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15)_0%,_transparent_60%)]" />
          
          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  Ready to Get
                </span>{' '}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Hired?
                </span>
              </h2>
              <p className="text-xl text-white/40 max-w-xl mx-auto mb-10">
                Join thousands of job seekers who landed their dream roles with Hireable.ai
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {session ? (
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative px-8 py-4 rounded-xl font-semibold text-white"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-xl opacity-70 blur-lg group-hover:opacity-100 transition-all" />
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl" />
                      <span className="relative flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative px-8 py-4 rounded-xl font-semibold text-white"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 rounded-xl opacity-70 blur-lg group-hover:opacity-100 transition-all" />
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl" />
                        <span className="relative flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Start Free Analysis
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </motion.button>
                    </Link>
                    <Link href="/auth/signup">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:border-white/40 transition-colors"
                      >
                        Sign Up
                      </motion.button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-16 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-xl font-bold text-white">
                  Hireable<span className="text-violet-400">.ai</span>
                </span>
              </div>

              {/* Copyright */}
              <p className="text-white/30 text-sm">
                © 2026 Hireable.ai — Land your dream job faster with AI-powered prep.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </IntroOverlay>
  )
}

