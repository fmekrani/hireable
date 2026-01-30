'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Link as LinkIcon,
  Upload,
  FileText,
  Check,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  Target,
  TrendingUp,
  BookOpen,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { cn } from '@/lib/utils'

// Mock data
const mockSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git', 'Agile', 'Testing']
const mockMissingSkills = [
  { skill: 'System Design', priority: 'high', resources: 3 },
  { skill: 'GraphQL', priority: 'medium', resources: 5 },
  { skill: 'Docker', priority: 'low', resources: 4 },
  { skill: 'Kubernetes', priority: 'low', resources: 2 },
]
const mockResources = [
  { title: 'System Design Primer', type: 'Course', platform: 'Coursera', duration: '8 hours' },
  { title: 'GraphQL Fundamentals', type: 'Tutorial', platform: 'YouTube', duration: '2 hours' },
  { title: 'Docker for Beginners', type: 'Course', platform: 'Udemy', duration: '5 hours' },
]

export default function AnalysisPage() {
  const [url, setUrl] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const coverLetterInputRef = useRef<HTMLInputElement>(null)

  const handleAnalyze = () => {
    if (!url || !resumeFile) return
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowResults(true)
    }, 2500)
  }

  const canAnalyze = url.length > 0 && resumeFile !== null

  return (
    <DashboardLayout>
      <div className="p-8 pt-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Job Analysis</h1>
              <p className="text-white/40">Analyze your fit for any job posting</p>
            </div>
          </div>
        </motion.div>

        {/* Input Section */}
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Job URL Input */}
              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Job Posting URL</h3>
                    <p className="text-sm text-white/40">LinkedIn, Indeed, or any company career page</p>
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              {/* File Uploads Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Resume Upload */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Resume</h3>
                      <p className="text-sm text-white/40">PDF, DOC, or DOCX</p>
                    </div>
                  </div>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    className={cn(
                      "w-full border-2 border-dashed rounded-xl p-6 transition-all group",
                      resumeFile
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/10 hover:border-violet-500/30 hover:bg-white/5"
                    )}
                  >
                    {resumeFile ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{resumeFile.name}</p>
                          <p className="text-sm text-white/40">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-white/40" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-white/30 group-hover:text-violet-400 transition-colors" />
                        <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                          Click to upload resume
                        </p>
                      </div>
                    )}
                  </button>
                </div>

                {/* Cover Letter Upload (Optional) */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Cover Letter <span className="text-white/30 font-normal">(Optional)</span></h3>
                      <p className="text-sm text-white/40">PDF, DOC, or DOCX</p>
                    </div>
                  </div>
                  <input
                    ref={coverLetterInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    onClick={() => coverLetterInputRef.current?.click()}
                    className={cn(
                      "w-full border-2 border-dashed rounded-xl p-6 transition-all group",
                      coverLetterFile
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-white/10 hover:border-violet-500/30 hover:bg-white/5"
                    )}
                  >
                    {coverLetterFile ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Check className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{coverLetterFile.name}</p>
                          <p className="text-sm text-white/40">{(coverLetterFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCoverLetterFile(null); }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-white/40" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-white/30 group-hover:text-amber-400 transition-colors" />
                        <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                          Click to upload (optional)
                        </p>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Analyze Button */}
              <motion.button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                whileHover={canAnalyze ? { scale: 1.01 } : {}}
                whileTap={canAnalyze ? { scale: 0.99 } : {}}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all",
                  canAnalyze && !isAnalyzing
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Job Fit
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Analysis Results</h2>
                  <p className="text-white/40">Based on your resume and the job posting</p>
                </div>
                <button
                  onClick={() => { setShowResults(false); setUrl(''); setResumeFile(null); setCoverLetterFile(null); }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white text-sm font-medium transition-all"
                >
                  New Analysis
                </button>
              </div>

              {/* Score Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Readiness Score */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-white">Readiness Score</h3>
                  </div>
                  <div className="relative flex items-center justify-center mb-4">
                    <svg className="w-32 h-32 -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 352" }}
                        animate={{ strokeDasharray: "253 352" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">72</span>
                    </div>
                  </div>
                  <p className="text-center text-sm text-white/40">Strong match for this role</p>
                </div>

                {/* Matched Skills */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white">Matched Skills</h3>
                    <span className="ml-auto text-sm text-emerald-400 font-medium">{mockSkills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mockSkills.map((skill, i) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-full border border-emerald-500/20"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="font-semibold text-white">Skill Gaps</h3>
                    <span className="ml-auto text-sm text-amber-400 font-medium">{mockMissingSkills.length}</span>
                  </div>
                  <div className="space-y-2">
                    {mockMissingSkills.map((item, i) => (
                      <motion.div
                        key={item.skill}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-lg border",
                          item.priority === 'high' && "bg-red-500/10 border-red-500/20",
                          item.priority === 'medium' && "bg-amber-500/10 border-amber-500/20",
                          item.priority === 'low' && "bg-emerald-500/10 border-emerald-500/20"
                        )}
                      >
                        <span className="text-sm text-white font-medium">{item.skill}</span>
                        <span className={cn(
                          "text-xs font-bold uppercase",
                          item.priority === 'high' && "text-red-400",
                          item.priority === 'medium' && "text-amber-400",
                          item.priority === 'low' && "text-emerald-400"
                        )}>
                          {item.priority}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Resources */}
              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Recommended Resources</h3>
                    <p className="text-sm text-white/40">Curated learning materials for your skill gaps</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {mockResources.map((resource, i) => (
                    <motion.div
                      key={resource.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="group p-4 bg-black/30 rounded-xl border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs font-medium rounded">
                          {resource.type}
                        </span>
                        <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors" />
                      </div>
                      <h4 className="font-medium text-white mb-1 group-hover:text-violet-400 transition-colors">
                        {resource.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{resource.platform}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{resource.duration}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Timeline Preview */}
              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Estimated Timeline</h3>
                      <p className="text-sm text-white/40">Suggested study plan to close skill gaps</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-fuchsia-500/10 text-fuchsia-400 text-sm font-medium rounded-full">
                    ~3 weeks
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {['Week 1', 'Week 2', 'Week 3'].map((week, i) => (
                    <div key={week} className="flex-1 relative">
                      <div className={cn(
                        "h-2 rounded-full",
                        i === 0 && "bg-gradient-to-r from-violet-500 to-fuchsia-500",
                        i === 1 && "bg-gradient-to-r from-fuchsia-500 to-pink-500",
                        i === 2 && "bg-gradient-to-r from-pink-500 to-rose-500"
                      )} />
                      <p className="text-xs text-white/40 mt-2">{week}</p>
                      <p className="text-xs text-white/60">
                        {i === 0 && 'System Design'}
                        {i === 1 && 'GraphQL'}
                        {i === 2 && 'Docker & K8s'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
