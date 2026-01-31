"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Link as LinkIcon,
  FileText,
  Upload,
  Check,
  X,
  Loader2,
  Sparkles,
  Mic,
  Clipboard,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnalyzeFormProps {
  onAnalyze: () => void
  isAnalyzing: boolean
  hasResults: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function AnalyzeForm({ onAnalyze, isAnalyzing, hasResults }: AnalyzeFormProps) {
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [isDraggingResume, setIsDraggingResume] = useState(false)
  const [isDraggingCover, setIsDraggingCover] = useState(false)
  
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const coverLetterInputRef = useRef<HTMLInputElement>(null)

  const validateUrl = (value: string) => {
    if (!value) {
      setUrlError("")
      return
    }
    try {
      new URL(value)
      setUrlError("")
    } catch {
      setUrlError("Please enter a valid URL")
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      validateUrl(text)
    } catch (err) {
      console.error("Failed to paste:", err)
    }
  }

  const handleDrop = (
    e: React.DragEvent,
    setFile: (file: File | null) => void,
    setDragging: (v: boolean) => void
  ) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === "application/pdf" || file.name.endsWith(".doc") || file.name.endsWith(".docx"))) {
      setFile(file)
    }
  }

  const canAnalyze = url && !urlError && resumeFile

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border shadow-2xl shadow-black/20 overflow-hidden"
    >
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Analyze Your Job Fit
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a job URL and upload your resume to get started
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[
            { step: 1, label: "Job URL", done: !!url && !urlError },
            { step: 2, label: "Resume", done: !!resumeFile },
            { step: 3, label: "Analyze", done: hasResults },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  item.done
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.done ? <Check className="w-4 h-4" /> : item.step}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm font-medium hidden sm:inline",
                  item.done ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {idx < 2 && <div className="w-8 lg:w-12 h-px bg-border mx-3" />}
            </div>
          ))}
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Job Posting URL <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              placeholder="https://linkedin.com/jobs/view/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                validateUrl(e.target.value)
              }}
              className={cn(
                "w-full pl-11 pr-24 py-3.5 bg-muted/50 border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:bg-background transition-all",
                urlError
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border focus:ring-primary/30"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={handlePaste}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="Paste from clipboard"
              >
                <Clipboard className="w-4 h-4" />
              </button>
              {url && (
                <button
                  onClick={() => {
                    setUrl("")
                    setUrlError("")
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {urlError && (
            <p className="mt-2 text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {urlError}
            </p>
          )}
        </div>

        {/* Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Resume <span className="text-destructive">*</span>
            </label>
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              onClick={() => resumeInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDraggingResume(true)
              }}
              onDragLeave={() => setIsDraggingResume(false)}
              onDrop={(e) => handleDrop(e, setResumeFile, setIsDraggingResume)}
              className={cn(
                "w-full border-2 border-dashed rounded-xl p-5 transition-all duration-200 text-left group",
                resumeFile
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : isDraggingResume
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {resumeFile ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(resumeFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setResumeFile(null)
                    }}
                    className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Drop your resume here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse • PDF, DOC, DOCX
                  </p>
                </div>
              )}
            </button>
          </div>

          {/* Cover Letter Upload */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Cover Letter{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              ref={coverLetterInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              onClick={() => coverLetterInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDraggingCover(true)
              }}
              onDragLeave={() => setIsDraggingCover(false)}
              onDrop={(e) => handleDrop(e, setCoverLetterFile, setIsDraggingCover)}
              className={cn(
                "w-full border-2 border-dashed rounded-xl p-5 transition-all duration-200 text-left group",
                coverLetterFile
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : isDraggingCover
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {coverLetterFile ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {coverLetterFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(coverLetterFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCoverLetterFile(null)
                    }}
                    className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Drop cover letter here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse • PDF, DOC, DOCX
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            size="lg"
            className="flex-1 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Job Posting
              </>
            )}
          </Button>
          <Button variant="secondary" size="lg" asChild className="h-12">
            <Link href="/mock-interview" className="gap-2">
              <Mic className="w-5 h-5" />
              Practice Interview
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
