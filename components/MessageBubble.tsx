'use client'

import React, { useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, CheckCircle, User, Bot } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MessageBubbleProps {
  message: Message
  question?: string
  onCopy: (text: string) => void
  copiedId: string | null
}

export default function MessageBubble({
  message,
  question,
  onCopy,
  copiedId,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isCopied = copiedId === message.id

  const handleCopy = useCallback(() => {
    const textToCopy = question
      ? `السؤال:\n${question}\n\nالإجابة:\n${message.content}`
      : message.content
    onCopy(textToCopy)
  }, [message.content, question, onCopy])

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-700'
            : 'bg-gradient-to-br from-seu-green to-seu-green-dark'
        }`}
      >
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <Bot size={18} className="text-white" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tl-sm'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tr-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-seu-green underline hover:text-seu-green-dark font-medium"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 rounded-lg shadow-sm">
                      <table className="w-full">{children}</table>
                    </div>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = className?.includes('language-')
                    return isBlock ? (
                      <code className={className}>{children}</code>
                    ) : (
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer: time + copy button */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>

          {!isUser && (
            <button
              onClick={handleCopy}
              title={isCopied ? 'تم النسخ!' : 'نسخ السؤال والإجابة'}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all duration-200 ${
                isCopied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-seu-green-light hover:text-seu-green'
              }`}
            >
              {isCopied ? (
                <>
                  <CheckCircle size={12} />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>نسخ</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
