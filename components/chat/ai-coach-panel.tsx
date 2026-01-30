"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  PenLine,
  HelpCircle,
  CalendarDays,
  FileEdit,
  Bot,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SuggestedPrompt {
  icon: React.ElementType
  label: string
  prompt: string
}

const suggestedPrompts: SuggestedPrompt[] = [
  {
    icon: PenLine,
    label: "Rewrite my bullet",
    prompt: "Can you help me rewrite one of my resume bullet points to better match this job?"
  },
  {
    icon: HelpCircle,
    label: "Explain skill gaps",
    prompt: "Can you explain why the identified skill gaps are important for this role?"
  },
  {
    icon: CalendarDays,
    label: "2-week plan",
    prompt: "Create a detailed 2-week study plan to address my most critical skill gaps."
  },
  {
    icon: FileEdit,
    label: "Tailor to JD",
    prompt: "How can I tailor my resume to better match this job description?"
  }
]

const mockResponses: Record<string, string> = {
  "Rewrite my bullet": `Here's a more impactful version:

**Before:** "Worked on frontend development using React"

**After:** "Architected and delivered 5+ customer-facing React features, improving user engagement by 23% and reducing page load times by 40%"

The key changes:
• Added specific metrics (5+ features, 23%, 40%)
• Used strong action verb (Architected)
• Showed business impact (engagement, performance)`,
  "Explain skill gaps": `The identified skill gaps are critical for this role:

**System Design (High Priority)**
Senior roles require designing scalable systems. Interviewers will assess your ability to think at scale.

**GraphQL (Medium Priority)**
The team uses GraphQL for their API layer. Familiarity will help you onboard faster.

**Docker (Lower Priority)**
Used for local development and CI/CD. Can be learned on the job.`,
  "2-week plan": `Here's your personalized 2-week plan:

**Week 1: System Design Fundamentals**
• Day 1-2: Review "System Design Interview" by Alex Xu
• Day 3-4: Practice designing Twitter, URL shortener
• Day 5-7: Mock interviews with focus on trade-offs

**Week 2: GraphQL + Docker Basics**
• Day 1-3: Complete GraphQL official tutorial
• Day 4-5: Build a small project with Apollo Client
• Day 6-7: Docker basics + containerize your project`,
  "Tailor to JD": `Here's how to tailor your resume:

1. **Add Keywords**
   Include: "React", "TypeScript", "CI/CD", "agile"

2. **Reorder Experience**
   Lead with your most relevant frontend work

3. **Quantify Impact**
   Add metrics to every bullet point

4. **Match Their Language**
   Use phrases from the JD like "user-centric" and "scalable"`,
  default: `That's a great question! Based on your analysis:

• Your strongest matches are in **React** and **TypeScript**
• Focus your prep on **System Design** first - it's the highest priority gap
• Consider the 2-week study plan I can generate for you

Would you like me to elaborate on any specific area?`
}

interface AiCoachPanelProps {
  isCollapsible?: boolean
  className?: string
}

export function AiCoachPanel({ isCollapsible = false, className }: AiCoachPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hi! 👋 I'm your AI Career Coach. I can help you understand your job analysis, improve your resume, and create a study plan. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isTyping) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      // Find matching mock response
      let response = mockResponses.default
      for (const key of Object.keys(mockResponses)) {
        if (messageText.toLowerCase().includes(key.toLowerCase())) {
          response = mockResponses[key]
          break
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handlePromptClick = (prompt: SuggestedPrompt) => {
    handleSend(prompt.prompt)
  }

  if (isCollapsible && isCollapsed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsCollapsed(false)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all group",
          className
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">AI Coach</p>
          <p className="text-xs text-muted-foreground">Click to chat</p>
        </div>
        <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "flex flex-col bg-card/60 backdrop-blur-xl rounded-2xl border border-border shadow-2xl shadow-black/20 overflow-hidden",
        isCollapsible ? "fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[500px]" : "h-full",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Coach</h3>
            <p className="text-xs text-muted-foreground">Your career assistant</p>
          </div>
        </div>
        {isCollapsible && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex gap-3",
                msg.type === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  msg.type === "user"
                    ? "bg-primary/20"
                    : "bg-muted"
                )}
              >
                {msg.type === "user" ? (
                  <User className="w-4 h-4 text-primary" />
                ) : (
                  <Bot className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] px-4 py-3 rounded-2xl text-sm",
                  msg.type === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : "bg-muted text-foreground rounded-tl-md"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => handlePromptClick(prompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <prompt.icon className="w-3 h-3" />
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your analysis..."
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
