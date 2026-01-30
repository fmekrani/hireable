'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  Play, 
  Square, 
  MessageCircle, 
  Sparkles, 
  Clock, 
  Building2,
  Briefcase,
  BarChart3,
  Send,
  User,
  Bot,
  Star,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { cn } from '@/lib/utils'

const interviewQuestions = [
  "Tell me about yourself and your experience.",
  "Why are you interested in this role?",
  "Describe a challenging project you worked on.",
  "How do you handle tight deadlines?",
  "Where do you see yourself in 5 years?",
]

const roles = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
]

const companies = [
  'Google',
  'Meta',
  'Amazon',
  'Apple',
  'Microsoft',
  'Netflix',
  'Stripe',
  'Other',
]

const difficulties = [
  { id: 'easy', label: 'Easy', desc: 'Entry-level questions' },
  { id: 'medium', label: 'Medium', desc: 'Mid-level complexity' },
  { id: 'hard', label: 'Hard', desc: 'Senior-level deep dives' },
]

interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function MockInterviewPage() {
  const [stage, setStage] = useState<'setup' | 'interview' | 'feedback'>('setup')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const startInterview = () => {
    if (!selectedRole) return
    setStage('interview')
    setMessages([
      {
        role: 'ai',
        content: `Welcome to your ${selectedDifficulty} level ${selectedRole} interview${selectedCompany ? ` for ${selectedCompany}` : ''}. Let's begin!\n\n${interviewQuestions[0]}`,
        timestamp: new Date(),
      }
    ])
  }

  const sendMessage = () => {
    if (!inputValue.trim()) return
    
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      if (currentQuestion < interviewQuestions.length - 1) {
        const nextQ = currentQuestion + 1
        setCurrentQuestion(nextQ)
        const aiMessage: Message = {
          role: 'ai',
          content: `Great answer! Here's your next question:\n\n${interviewQuestions[nextQ]}`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        const aiMessage: Message = {
          role: 'ai',
          content: "Excellent! You've completed all the interview questions. Click 'End Interview' to see your feedback.",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiMessage])
      }
    }, 1500)
  }

  const endInterview = () => {
    setStage('feedback')
  }

  const restartInterview = () => {
    setStage('setup')
    setSelectedRole('')
    setSelectedCompany('')
    setSelectedDifficulty('medium')
    setCurrentQuestion(0)
    setMessages([])
    setInputValue('')
  }

  return (
    <DashboardLayout>
      <div className="p-8 pt-12 h-screen flex flex-col">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex-shrink-0"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
              <p className="text-white/40">Practice with AI-powered interview simulations</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Setup Stage */}
          {stage === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto"
            >
              <div className="max-w-3xl space-y-6">
                {/* Role Selection */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Target Role</h3>
                      <p className="text-sm text-white/40">What position are you interviewing for?</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {roles.map(role => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                          selectedRole === role
                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                            : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company Selection */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Target Company <span className="text-white/30 font-normal">(Optional)</span></h3>
                      <p className="text-sm text-white/40">Tailor questions to company culture</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {companies.map(company => (
                      <button
                        key={company}
                        onClick={() => setSelectedCompany(selectedCompany === company ? '' : company)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          selectedCompany === company
                            ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                            : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Difficulty Level</h3>
                      <p className="text-sm text-white/40">Choose your challenge level</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {difficulties.map(diff => (
                      <button
                        key={diff.id}
                        onClick={() => setSelectedDifficulty(diff.id)}
                        className={cn(
                          "px-4 py-4 rounded-xl transition-all text-left",
                          selectedDifficulty === diff.id
                            ? "bg-amber-500/20 border border-amber-500/30"
                            : "bg-white/5 border border-white/5 hover:bg-white/10"
                        )}
                      >
                        <p className={cn(
                          "font-semibold mb-1",
                          selectedDifficulty === diff.id ? "text-amber-400" : "text-white/60"
                        )}>
                          {diff.label}
                        </p>
                        <p className="text-xs text-white/40">{diff.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <motion.button
                  onClick={startInterview}
                  disabled={!selectedRole}
                  whileHover={selectedRole ? { scale: 1.01 } : {}}
                  whileTap={selectedRole ? { scale: 0.99 } : {}}
                  className={cn(
                    "w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all",
                    selectedRole
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  )}
                >
                  <Play className="w-5 h-5" />
                  Start Interview
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Interview Stage */}
          {stage === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Interview Header */}
              <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-4 mb-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-full text-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    Live Interview
                  </div>
                  <span className="text-white/40 text-sm">
                    Question {currentQuestion + 1} of {interviewQuestions.length}
                  </span>
                </div>
                <button
                  onClick={endInterview}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  End Interview
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-white/5 rounded-full mb-4 flex-shrink-0">
                <motion.div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / interviewQuestions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-zinc-900/30 rounded-xl border border-white/5 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        msg.role === 'user' && "flex-row-reverse"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        msg.role === 'ai' 
                          ? "bg-gradient-to-br from-rose-500 to-pink-600" 
                          : "bg-violet-500/20"
                      )}>
                        {msg.role === 'ai' ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-violet-400" />
                        )}
                      </div>
                      <div className={cn(
                        "max-w-[80%] rounded-xl px-4 py-3",
                        msg.role === 'ai' 
                          ? "bg-white/5 text-white" 
                          : "bg-violet-500/20 text-white"
                      )}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 flex-shrink-0">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your answer..."
                      className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputValue.trim()}
                      className={cn(
                        "px-4 py-3 rounded-xl transition-all flex items-center gap-2",
                        inputValue.trim()
                          ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                          : "bg-white/5 text-white/30 cursor-not-allowed"
                      )}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Feedback Stage */}
          {stage === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto"
            >
              <div className="max-w-3xl space-y-6">
                {/* Overall Score */}
                <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-8 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Great Performance!</h2>
                  <p className="text-white/40 mb-6">You scored above average for {selectedRole} interviews</p>
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-400">78</p>
                      <p className="text-sm text-white/40">Overall Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-violet-400">{messages.filter(m => m.role === 'user').length}</p>
                      <p className="text-sm text-white/40">Questions Answered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-amber-400">4:32</p>
                      <p className="text-sm text-white/40">Time Taken</p>
                    </div>
                  </div>
                </div>

                {/* Feedback Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ThumbsUp className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-semibold text-white">Strengths</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-white/60">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Clear and structured responses
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Good use of specific examples
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Confident communication style
                      </li>
                    </ul>
                  </div>

                  <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ThumbsDown className="w-5 h-5 text-amber-400" />
                      <h3 className="font-semibold text-white">Areas to Improve</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-white/60">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Add more quantifiable achievements
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Elaborate on technical decisions
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Practice the STAR method
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={restartInterview}
                    className="flex-1 py-4 rounded-xl font-semibold bg-white/5 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Practice Again
                  </button>
                  <button
                    onClick={restartInterview}
                    className="flex-1 py-4 rounded-xl font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Try Different Role
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
