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
  Zap,
  Home,
  BarChart3,
  Video,
  Calendar,
  Trash2,
  History
} from 'lucide-react'
import { LimelightNav } from '@/components/ui/limelight-nav-new'
import { ProfileDropdown } from '@/components/ui/profile-dropdown'
import { cn } from '@/lib/utils'

// Mock data for previous analyses
const previousAnalyses = [
  { id: 1, company: 'Google', position: 'Senior SWE', date: 'Jan 28', score: 85, status: 'completed' },
  { id: 2, company: 'Amazon', position: 'SDE II', date: 'Jan 25', score: 72, status: 'completed' },
  { id: 3, company: 'Meta', position: 'E4 Engineer', date: 'Jan 22', score: 78, status: 'completed' },
  { id: 4, company: 'Apple', position: 'Software Engineer', date: 'Jan 20', score: 68, status: 'completed' },
]

const mockSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git', 'Agile', 'Testing']
const mockMissingSkills = [
  { skill: 'System Design', priority: 'high', resources: 3 },
  { skill: 'GraphQL', priority: 'medium', resources: 5 },
  { skill: 'Docker', priority: 'low', resources: 4 },
]
const mockResources = [
  { title: 'System Design Primer', type: 'Course', platform: 'Coursera', duration: '8 hours' },
  { title: 'GraphQL Fundamentals', type: 'Tutorial', platform: 'YouTube', duration: '2 hours' },
  { title: 'Docker for Beginners', type: 'Course', platform: 'Udemy', duration: '5 hours' },
]

const navItems = [
  { id: "home", icon: <Home />, label: "Home", href: "/" },
  { id: "analysis", icon: <BarChart3 />, label: "Analysis", href: "/analysis" },
  { id: "interview", icon: <Video />, label: "Interview", href: "/interview" },
  { id: "calendar", icon: <Calendar />, label: "Calendar", href: "/calendar" },
]

export default function AnalysisPage() {
  const [url, setUrl] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<number | null>(null)
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
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black/80 text-white overflow-x-hidden">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <LimelightNav items={navItems} />
          <ProfileDropdown />
        </div>
      </div>

      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 md:px-6">
        <div className="flex gap-6 max-w-7xl mx-auto">
          {/* Sidebar - Previous Analyses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="sticky top-32 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 px-6 py-4 border-b border-white/10">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Previous Analyses
                </h3>
              </div>
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {previousAnalyses.map((analysis) => (
                  <motion.div
                    key={analysis.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedAnalysis(analysis.id)}
                    className={cn(
                      'px-6 py-4 cursor-pointer transition-all',
                      selectedAnalysis === analysis.id
                        ? 'bg-cyan-500/20 border-l-2 border-cyan-500'
                        : 'hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white truncate">{analysis.company}</h4>
                        <p className="text-xs text-white/60 truncate">{analysis.position}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Delete handler
                        }}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{analysis.date}</span>
                      <div className={cn(
                        'text-xs font-bold px-2 py-1 rounded',
                        analysis.score >= 80 ? 'bg-green-500/20 text-green-400' :
                        analysis.score >= 70 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      )}>
                        {analysis.score}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Job Analysis</h1>
                <p className="text-white/60">Analyze your fit for any job posting</p>
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
                className="space-y-6 mb-12"
              >
                {/* Job URL Input */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Job Posting URL</h3>
                      <p className="text-sm text-white/40">LinkedIn, Indeed, or any company career page</p>
                    </div>
                  </div>
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/jobs/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                  />
                </motion.div>

                {/* Resume Upload */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Your Resume</h3>
                      <p className="text-sm text-white/40">PDF or Word document (required)</p>
                    </div>
                  </div>
                  <div
                    onClick={() => resumeInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all"
                  >
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-white">{resumeFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <FileText className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60">Click to upload or drag and drop</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </motion.div>

                {/* Cover Letter Upload */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Cover Letter</h3>
                      <p className="text-sm text-white/40">Optional - helps with better recommendations</p>
                    </div>
                  </div>
                  <div
                    onClick={() => coverLetterInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all"
                  >
                    {coverLetterFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-white">{coverLetterFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <FileText className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60">Click to upload or drag and drop</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverLetterInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </motion.div>

                {/* Analyze Button */}
                <motion.button
                  disabled={!canAnalyze || isAnalyzing}
                  onClick={handleAnalyze}
                  className={cn(
                    'w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300',
                    canAnalyze && !isAnalyzing
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50'
                      : 'bg-white/10 text-white/50'
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
                      Run Analysis
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
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Match Score */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-8 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Overall Match Score</h3>
                      <p className="text-white/60">Based on your resume and the job requirements</p>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-bold text-cyan-400 mb-1">72%</div>
                      <span className="text-sm text-green-400">Good Fit</span>
                    </div>
                  </div>
                </motion.div>

                {/* Matched Skills */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Check className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-semibold text-white">Matched Skills</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {mockSkills.map((skill) => (
                      <motion.div
                        key={skill}
                        whileHover={{ x: 4 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-white">{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Missing Skills */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-amber-400" />
                    <h3 className="text-xl font-semibold text-white">Skills to Develop</h3>
                  </div>
                  <div className="space-y-3">
                    {mockMissingSkills.map((item) => (
                      <motion.div
                        key={item.skill}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                      >
                        <div>
                          <h4 className="text-white font-medium">{item.skill}</h4>
                          <p className="text-sm text-white/60">Priority: {item.priority}</p>
                        </div>
                        <span className="text-sm text-amber-400">{item.resources} resources</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Recommended Resources */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Recommended Resources</h3>
                  </div>
                  <div className="space-y-3">
                    {mockResources.map((resource, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-all cursor-pointer"
                      >
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{resource.title}</h4>
                          <p className="text-sm text-white/60">{resource.platform} • {resource.type}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-white/60 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {resource.duration}
                          </span>
                          <ExternalLink className="w-4 h-4 text-white/40" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 pt-4"
                >
                  <button
                    onClick={() => {
                      setShowResults(false)
                      setUrl('')
                      setResumeFile(null)
                      setCoverLetterFile(null)
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all"
                  >
                    Analyze Another Job
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                    Save Analysis
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
