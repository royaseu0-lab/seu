'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Trash2, RefreshCw, ChevronDown } from 'lucide-react'
import MessageBubble from './MessageBubble'
import ExportPDF from './ExportPDF'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_QUESTIONS = [
  'ما هي شروط القبول في الجامعة السعودية الإلكترونية؟',
  'ما هي التخصصات المتاحة في كلية الحوسبة؟',
  'كم تبلغ الرسوم الدراسية؟',
  'كيف أسجل في الجامعة السعودية الإلكترونية؟',
  'ما هي مواعيد الفصل الدراسي؟',
  'ما الفرق بين برامج البكالوريوس والدراسات العليا؟',
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100)
    }
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const getQuestion = (msgId: string): string | undefined => {
    const idx = messages.findIndex((m) => m.id === msgId)
    if (idx > 0 && messages[idx - 1].role === 'user') {
      return messages[idx - 1].content
    }
    return undefined
  }

  const handleCopy = useCallback(async (text: string, msgId?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (msgId) {
        setCopiedId(msgId)
        setTimeout(() => setCopiedId(null), 2500)
      }
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      if (msgId) {
        setCopiedId(msgId)
        setTimeout(() => setCopiedId(null), 2500)
      }
    }
  }, [])

  const handleCopyMessage = useCallback(
    (text: string) => {
      const idx = messages.findIndex((m) => m.content === text && m.role === 'assistant')
      if (idx !== -1) {
        handleCopy(text, messages[idx].id)
      }
    },
    [messages, handleCopy]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)
      setStreamingContent('')

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }

      try {
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') break
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.text) {
                    fullContent += parsed.text
                    setStreamingContent(fullContent)
                  }
                } catch {
                  // ignore parse errors
                }
              }
            }
          }
        }

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fullContent,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setStreamingContent('')
      } catch (error) {
        console.error('Error sending message:', error)
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            '⚠️ **حدث خطأ أثناء معالجة طلبك.**\n\nيرجى التحقق من:\n- اتصالك بالإنترنت\n- مفتاح API\n\nثم حاول مرة أخرى.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setStreamingContent('')
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

  const clearChat = () => {
    if (window.confirm('هل تريد مسح المحادثة بالكامل؟')) {
      setMessages([])
      setStreamingContent('')
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-l from-seu-green-dark to-seu-green text-white shadow-lg z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* SEU Logo area */}
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner overflow-hidden">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.15" />
                  <text x="20" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial">
                    SEU
                  </text>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">
                  مساعد الجامعة السعودية الإلكترونية
                </h1>
                <p className="text-xs text-white/70">
                  Saudi Electronic University AI Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ExportPDF messages={messages} />
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  title="مسح المحادثة"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto relative"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {/* Welcome screen */}
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-seu-green to-seu-green-dark flex items-center justify-center shadow-lg">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <text x="22" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white" fontFamily="Arial">
                    SEU
                  </text>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-seu-green-dark mb-2">
                أهلاً وسهلاً!
              </h2>
              <p className="text-gray-500 mb-1 text-sm">
                أنا مساعدك الذكي المتخصص في الجامعة السعودية الإلكترونية
              </p>
              <p className="text-gray-400 text-xs mb-8">
                اسألني عن القبول، التخصصات، الرسوم، الجداول وأي استفسار آخر
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-right px-4 py-3 bg-white border border-seu-green/20 rounded-xl text-sm text-gray-700 hover:bg-seu-green-light hover:border-seu-green/40 hover:text-seu-green-dark transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="text-seu-green ml-1">◈</span> {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              question={msg.role === 'assistant' ? getQuestion(msg.id) : undefined}
              onCopy={(text) => handleCopy(text, msg.id)}
              copiedId={copiedId}
            />
          ))}

          {/* Streaming message */}
          {isLoading && streamingContent && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-seu-green to-seu-green-dark flex items-center justify-center shadow-sm">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <text x="9" y="13" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white" fontFamily="Arial">SEU</text>
                </svg>
              </div>
              <div className="flex-1 max-w-[85%]">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                  <div className="markdown-content text-sm typing-cursor">
                    <ReactMarkdownWrapper content={streamingContent} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading dots */}
          {isLoading && !streamingContent && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-seu-green to-seu-green-dark flex items-center justify-center shadow-sm">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <text x="9" y="13" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white" fontFamily="Arial">SEU</text>
                </svg>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 bg-seu-green rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-seu-green rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-seu-green rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-seu-green text-white p-2 rounded-full shadow-lg hover:bg-seu-green-dark transition-all animate-fade-in z-20"
          >
            <ChevronDown size={20} />
          </button>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="اكتب سؤالك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)"
                disabled={isLoading}
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-seu-green/30 focus:border-seu-green disabled:opacity-60 transition-all leading-relaxed"
                style={{ maxHeight: '140px', overflowY: 'auto' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${
                !isLoading && input.trim()
                  ? 'bg-seu-green text-white hover:bg-seu-green-dark active:scale-95 shadow-seu-green/20'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Send size={18} className="rotate-180" />
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-2">
            المعلومات مستمدة من الجامعة السعودية الإلكترونية •{' '}
            <a
              href="https://www.seu.edu.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-seu-green hover:underline"
            >
              seu.edu.sa
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function ReactMarkdownWrapper({ content }: { content: string }) {
  const ReactMarkdown = require('react-markdown').default
  const remarkGfm = require('remark-gfm').default

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-seu-green underline">
            {children}
          </a>
        ),
        table: ({ children }: { children?: React.ReactNode }) => (
          <div className="overflow-x-auto my-3 rounded-lg shadow-sm">
            <table className="w-full">{children}</table>
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
