'use client'

import { useState, useRef, useEffect } from 'react'
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
import { supabase } from '@/lib/supabase/client'

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

interface SavedAnalysis {
  id: string
  company: string
  position: string
  date: string
  score: number
  url: string
  status: 'completed' | 'in-progress'
}

export default function AnalysisPage() {
  const [url, setUrl] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveConfirmation, setSaveConfirmation] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const [rawScrapePayload, setRawScrapePayload] = useState<Record<string, unknown> | null>(null)
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [resumeExtractError, setResumeExtractError] = useState<string | null>(null)
  const [parsedResume, setParsedResume] = useState<{
    contact: { name: string | null; email: string | null; phone: string | null; linkedin: string | null; github: string | null; location: string | null }
    summary: string | null
    experience: { title: string | null; company: string | null; startDate: string | null; endDate: string | null; current: boolean; highlights: string[] }[]
    education: { degree: string | null; institution: string | null; startDate: string | null; endDate: string | null; gpa: string | null }[]
    skills: { technical: string[]; languages: string[]; frameworks: string[]; tools: string[]; all: string[] }
    certifications: string[]
    projects: { name: string | null; description: string; technologies: string[]; highlights: string[] }[]
  } | null>(null)
  const [jobData, setJobData] = useState<{
    job_title: string
    company_name: string
    required_skills: string[]
    preferred_skills: string[]
    qualities: string[]
    job_url?: string
    description?: string
    years_required?: number | null
    location?: string | null
    employment_type?: string | string[] | null
    tech_stack?: string[]
    raw_html_length?: number
    scrape_error?: string | null
    source?: string
  } | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const coverLetterInputRef = useRef<HTMLInputElement>(null)

  // Load saved analyses from database on mount
  useEffect(() => {
    const loadSavedAnalyses = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const response = await fetch('/api/analysis/list', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        const result = await response.json()
        if (result.success && result.data) {
          const formattedAnalyses = result.data.map((analysis: any) => ({
            id: analysis.id,
            company: analysis.company_name,
            position: analysis.position_title,
            date: new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: analysis.match_score || 72,
            url: analysis.job_url,
            status: 'completed' as const,
          }))
          setSavedAnalyses(formattedAnalyses)
        }
      } catch (error) {
        console.error('[Analysis] Failed to load saved analyses:', error)
      }
    }

    loadSavedAnalyses()
  }, [])

  const saveAnalysis = async () => {
    if (!jobData) return
    
    setIsSaving(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('[Analysis Save] No session found')
        setSaveConfirmation({ show: true, message: 'Please sign in to save analyses', type: 'error' })
        setTimeout(() => setSaveConfirmation({ show: false, message: '', type: 'success' }), 3000)
        setIsSaving(false)
        return
      }

      console.log('[Analysis Save] Starting save, user:', session.user?.id)

      const response = await fetch('/api/analysis/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          company: jobData.company_name || 'Unknown Company',
          position: jobData.job_title || 'Unknown Position',
          score: 72,
          url: url,
          jobData: jobData,
        }),
      })

      console.log('[Analysis Save] API Response status:', response.status)
      const result = await response.json()
      console.log('[Analysis Save] API Response:', result)

      if (result.success) {
        const newAnalysis: SavedAnalysis = {
          id: result.data?.id || Date.now().toString(),
          company: jobData.company_name || 'Unknown Company',
          position: jobData.job_title || 'Unknown Position',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: 72,
          url: url,
          status: 'completed',
        }
        
        setSavedAnalyses([newAnalysis, ...savedAnalyses])
        setSelectedAnalysis(newAnalysis.id)
        setSaveConfirmation({ show: true, message: '✓ Analysis saved successfully!', type: 'success' })
        setTimeout(() => setSaveConfirmation({ show: false, message: '', type: 'success' }), 3000)
      } else {
        const errorMsg = result.error || result.details?.message || 'Failed to save analysis'
        console.error('[Analysis Save] API Error:', errorMsg, result.details)
        setSaveConfirmation({ show: true, message: errorMsg, type: 'error' })
        setTimeout(() => setSaveConfirmation({ show: false, message: '', type: 'success' }), 3000)
      }
    } catch (error) {
      console.error('[Analysis Save] Error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error saving analysis'
      setSaveConfirmation({ show: true, message: errorMsg, type: 'error' })
      setTimeout(() => setSaveConfirmation({ show: false, message: '', type: 'success' }), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteAnalysis = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSaveConfirmation({ show: true, message: 'Please sign in to delete analyses', type: 'error' })
        setTimeout(() => setSaveConfirmation({ show: false, message: '', type: 'success' }), 3000)
        return
      }

      const response = await fetch('/api/analysis/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ analysisId: id }),
      })

      const result = await response.json()

      if (result.success) {
        setSavedAnalyses(savedAnalyses.filter(a => a.id !== id))
        if (selectedAnalysis === id) {
          setSelectedAnalysis(null)
        }
        setSaveConfirmation({ show: true, message: '✓ Analysis deleted', type: 'success' })
        setTimeout(() => setSaveConfirmation({ show: false, message: '', type: 'success' }), 3000)
      } else {
        setSaveConfirmation({ show: true, message: 'Failed to delete analysis', type: 'error' })
        setTimeout(() => setSaveConfirmation({ show: false, message: '', type: 'success' }), 3000)
      }
    } catch (error) {
      console.error('[Analysis Delete] Error:', error)
      setSaveConfirmation({ show: true, message: 'Error deleting analysis', type: 'error' })
      setTimeout(() => setSaveConfirmation({ show: false, message: '', type: 'success' }), 3000)
    }
  }

  const handleAnalyze = async () => {
    console.log('[Job Analysis] handleAnalyze called, url:', url, 'resumeFile:', resumeFile?.name)
    if (!url || !resumeFile) {
      console.warn('[Job Analysis] Missing url or resumeFile, aborting')
      return
    }
    setIsAnalyzing(true)
    setScrapeError(null)
    setRawScrapePayload(null)
    setResumeText(null)
    setResumeExtractError(null)
    setParsedResume(null)

    try {
      let accessToken: string | undefined
      try {
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        )
        const result = await Promise.race([sessionPromise, timeoutPromise])
        if (result && 'data' in result) {
          accessToken = result.data.session?.access_token
        }
      } catch (error) {
        console.warn('[Job Analysis] Failed to read session, continuing without auth:', error)
      }

      console.log('[Job Analysis] Starting scrape for URL:', url)
      
      let response: Response
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        response = await fetch('/api/job/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ jobUrl: url }),
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)
      } catch (fetchError) {
        console.error('[Job Analysis] Network fetch failed:', fetchError)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout - the job page took too long to load')
        }
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to reach API'}`)
      }

      console.log('[Job Analysis] API Response status:', response.status)

      let payload: any
      try {
        payload = await response.json()
      } catch (parseError) {
        console.error('[Job Analysis] Failed to parse response JSON:', parseError)
        const text = await response.text()
        console.error('[Job Analysis] Response text:', text)
        throw new Error(`Invalid response format: ${parseError instanceof Error ? parseError.message : 'Failed to parse JSON'}`)
      }

      setRawScrapePayload(payload ?? null)

      if (!response.ok) {
        throw new Error(payload?.error || `API error: ${response.status} ${response.statusText}`)
      }

      if (!payload?.success) {
        throw new Error(payload?.error || 'Job scrape failed')
      }

      setJobData(payload.job_data ?? payload.job)

      // Extract text from resume file
      console.log('[Job Analysis] Extracting text from resume:', resumeFile.name)
      try {
        const resumeFormData = new FormData()
        resumeFormData.append('file', resumeFile)

        const resumeResponse = await fetch('/api/resume/extract', {
          method: 'POST',
          body: resumeFormData,
        })

        const resumePayload = await resumeResponse.json()
        console.log('[Job Analysis] Resume extraction result:', resumePayload.success, resumePayload.text?.length || 0, 'chars')

        if (resumePayload.success && resumePayload.text) {
          setResumeText(resumePayload.text)
          if (resumePayload.parsed) {
            setParsedResume(resumePayload.parsed)
          }
        } else {
          setResumeExtractError(resumePayload.error || 'Failed to extract resume text')
        }
      } catch (resumeError) {
        console.error('[Job Analysis] Resume extraction failed:', resumeError)
        setResumeExtractError(resumeError instanceof Error ? resumeError.message : 'Resume extraction failed')
      }

      setShowResults(true)
    } catch (error) {
      console.error('[Job Analysis] Scrape failed:', error)
      setScrapeError(error instanceof Error ? error.message : 'Job scrape failed')
      setJobData(null)
      setShowResults(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const canAnalyze = url.length > 0 && resumeFile !== null

  const matchedSkills = jobData?.required_skills?.length
    ? jobData.required_skills
    : mockSkills

  const missingSkills = jobData?.preferred_skills?.length
    ? jobData.preferred_skills.map((skill) => ({
        skill,
        priority: 'medium' as const,
        resources: 3,
      }))
    : mockMissingSkills

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
                  {savedAnalyses.length > 0 ? 'Saved Analyses' : 'No Analyses'}
                </h3>
              </div>
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {savedAnalyses.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-xs text-white/40">Run an analysis and save it to see it here</p>
                  </div>
                ) : (
                  savedAnalyses.map((analysis) => (
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
                            deleteAnalysis(analysis.id)
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
                  ))
                )}
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
                  {(scrapeError || rawScrapePayload) && (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Scrape Debug (Temporary)</h3>
                          <p className="text-sm text-white/40">Shows the last API response and error</p>
                        </div>
                      </div>
                      {scrapeError && (
                        <div className="text-sm text-red-300 mb-3">{scrapeError}</div>
                      )}
                      {rawScrapePayload && (
                        <div className="bg-black/40 border border-white/10 rounded-lg p-3 max-h-[260px] overflow-auto">
                          <pre className="text-xs text-white/80 whitespace-pre-wrap">
                            {JSON.stringify(rawScrapePayload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                {/* Match Score */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-8 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
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

                {/* Temporary: Parsed Scrape Output */}
                {jobData && (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Parsed Job Data (Temporary)</h3>
                        <p className="text-sm text-white/40">Raw fields extracted from the scraper</p>
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-lg p-4 max-h-[420px] overflow-auto">
                      <pre className="text-xs text-white/80 whitespace-pre-wrap">
                        {JSON.stringify(jobData, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {/* Temporary: Extracted Resume Text */}
                {(resumeText || resumeExtractError) && (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg ${resumeExtractError ? 'bg-red-500/20' : 'bg-purple-500/20'} flex items-center justify-center`}>
                        <Upload className={`w-5 h-5 ${resumeExtractError ? 'text-red-400' : 'text-purple-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">Parsed Resume (Temporary)</h3>
                        <p className="text-sm text-white/40">
                          {resumeText ? `${resumeText.length.toLocaleString()} characters extracted` : 'Raw text from your resume'}
                        </p>
                      </div>
                    </div>
                    {resumeExtractError && (
                      <div className="text-sm text-red-300 mb-3">{resumeExtractError}</div>
                    )}
                    {parsedResume && (
                      <div className="space-y-4">
                        {/* Contact Info */}
                        {parsedResume.contact.name && (
                          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Contact</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {parsedResume.contact.name && <div className="text-white"><span className="text-white/50">Name:</span> {parsedResume.contact.name}</div>}
                              {parsedResume.contact.email && <div className="text-white"><span className="text-white/50">Email:</span> {parsedResume.contact.email}</div>}
                              {parsedResume.contact.phone && <div className="text-white"><span className="text-white/50">Phone:</span> {parsedResume.contact.phone}</div>}
                              {parsedResume.contact.location && <div className="text-white"><span className="text-white/50">Location:</span> {parsedResume.contact.location}</div>}
                              {parsedResume.contact.linkedin && <div className="text-white"><span className="text-white/50">LinkedIn:</span> {parsedResume.contact.linkedin}</div>}
                              {parsedResume.contact.github && <div className="text-white"><span className="text-white/50">GitHub:</span> {parsedResume.contact.github}</div>}
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {parsedResume.summary && (
                          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Summary</h4>
                            <p className="text-sm text-white/80">{parsedResume.summary}</p>
                          </div>
                        )}

                        {/* Skills */}
                        {parsedResume.skills.all.length > 0 && (
                          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Skills ({parsedResume.skills.all.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {parsedResume.skills.all.slice(0, 20).map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">{skill}</span>
                              ))}
                              {parsedResume.skills.all.length > 20 && (
                                <span className="px-2 py-1 text-white/40 text-xs">+{parsedResume.skills.all.length - 20} more</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Experience */}
                        {parsedResume.experience.length > 0 && (
                          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Experience ({parsedResume.experience.length})</h4>
                            <div className="space-y-3">
                              {parsedResume.experience.slice(0, 3).map((exp, i) => (
                                <div key={i} className="border-l-2 border-cyan-500/30 pl-3">
                                  <div className="text-sm font-medium text-white">{exp.title || 'Role'}</div>
                                  <div className="text-xs text-white/60">{exp.company} {exp.startDate && `• ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`}</div>
                                  {exp.highlights.length > 0 && (
                                    <ul className="mt-1 text-xs text-white/50">
                                      {exp.highlights.slice(0, 2).map((h, j) => <li key={j}>• {h.slice(0, 100)}{h.length > 100 ? '...' : ''}</li>)}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {parsedResume.education.length > 0 && (
                          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Education ({parsedResume.education.length})</h4>
                            <div className="space-y-2">
                              {parsedResume.education.map((edu, i) => (
                                <div key={i} className="text-sm">
                                  <div className="text-white">{edu.degree}</div>
                                  <div className="text-white/60 text-xs">{edu.institution} {edu.endDate && `• ${edu.endDate}`}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {parsedResume.projects.length > 0 && (
                          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Projects ({parsedResume.projects.length})</h4>
                            <div className="space-y-2">
                              {parsedResume.projects.slice(0, 3).map((proj, i) => (
                                <div key={i}>
                                  <div className="text-sm text-white">{proj.name}</div>
                                  {proj.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {proj.technologies.slice(0, 5).map((tech, j) => (
                                        <span key={j} className="text-xs px-1.5 py-0.5 bg-white/10 text-white/60 rounded">{tech}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications */}
                        {parsedResume.certifications.length > 0 && (
                          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Certifications ({parsedResume.certifications.length})</h4>
                            <ul className="text-sm text-white/80 space-y-1">
                              {parsedResume.certifications.map((cert, i) => <li key={i}>• {cert}</li>)}
                            </ul>
                          </div>
                        )}

                        {/* Raw text toggle */}
                        {resumeText && (
                          <details className="bg-black/20 rounded-lg border border-white/5">
                            <summary className="p-3 text-sm text-white/40 cursor-pointer hover:text-white/60">View raw text ({resumeText.length.toLocaleString()} chars)</summary>
                            <pre className="p-4 text-xs text-white/60 whitespace-pre-wrap max-h-[200px] overflow-auto">{resumeText}</pre>
                          </details>
                        )}
                      </div>
                    )}
                    {!parsedResume && resumeText && (
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4 max-h-[420px] overflow-auto">
                        <pre className="text-xs text-white/80 whitespace-pre-wrap">
                          {resumeText}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}

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
                    {matchedSkills.map((skill) => (
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
                    {missingSkills.map((item) => (
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
                  <button className={cn("flex-1 py-3 rounded-xl text-white transition-all flex items-center justify-center gap-2", isSaving ? "bg-white/10 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/50")} onClick={saveAnalysis} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Analysis
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Save Confirmation Toast */}
      <AnimatePresence>
        {saveConfirmation.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={cn(
              'fixed top-24 left-1/2 z-50 px-6 py-3 rounded-lg backdrop-blur-xl border font-semibold flex items-center gap-2 transform -translate-x-1/2',
              saveConfirmation.type === 'success'
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            )}
          >
            {saveConfirmation.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            {saveConfirmation.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
