'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, 
  X, 
  Send, 
  Minus, 
  Sparkles,
  HelpCircle,
  Target,
  Edit3
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
}

const quickPrompts = [
  { icon: HelpCircle, text: "Why is System Design marked weak?" },
  { icon: Target, text: "What should I prioritize this week?" },
  { icon: Edit3, text: "Rewrite this bullet to match the JD" },
]

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! 👋 I can help you understand your job analysis, explain skill gaps, and suggest improvements. What would you like to know?',
    },
  ])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
    }
  }, [isOpen])

  const handleSend = (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate assistant response
    setTimeout(() => {
      const responses = [
        `Great question about "${messageText.slice(0, 30)}..." Based on the job requirements, I'd recommend focusing on the core technical skills first. The timeline suggests 2-3 weeks for each major skill area.`,
        `I can help with that! Looking at your analysis, the skill gaps are prioritized by how frequently they appear in similar job postings. Would you like me to explain the scoring?`,
        `That's a smart approach. The resources I've suggested are ordered by effectiveness - video courses for hands-on skills, documentation for reference, and practice projects for mastery.`,
      ]
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 800)

    setInput('')
  }

  return (
    <>
      {/* Desktop floating widget */}
      <div className="hidden md:block fixed bottom-4 right-4 z-40">
        {/* Chat panel */}
        <div 
          className={`absolute bottom-16 right-0 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
            isOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Ask about feedback</h3>
                <p className="text-xs text-white/70">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Minimize chat"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-md'
                      : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length < 3 && (
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.text)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-full text-xs font-medium transition-colors"
                >
                  <prompt.icon className="w-3 h-3" />
                  <span className="whitespace-nowrap">{prompt.text.slice(0, 25)}...</span>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all"
                aria-label="Chat message input"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 disabled:shadow-none"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
            isOpen 
              ? 'bg-slate-800 hover:bg-slate-700 rotate-0' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
          }`}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
          
          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
              1
            </span>
          )}
          
          {/* Pulse ring */}
          {!isOpen && hasUnread && (
            <span className="absolute inset-0 rounded-full bg-indigo-600 opacity-30 pulse-ring" />
          )}
        </button>
      </div>

      {/* Mobile full-width section */}
      <div className="md:hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-slate-200/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Ask about feedback</h3>
            <p className="text-xs text-white/70">AI Assistant</p>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="p-3 border-b border-slate-100 flex gap-2 overflow-x-auto bg-slate-50">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt.text)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-full text-xs font-medium border border-slate-200 transition-colors"
            >
              <prompt.icon className="w-3 h-3" />
              <span className="whitespace-nowrap">{prompt.text.slice(0, 20)}...</span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-md'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all"
              aria-label="Chat message input"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl transition-all active:scale-[0.98]"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
