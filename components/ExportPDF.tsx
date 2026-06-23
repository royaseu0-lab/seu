'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ExportPDFProps {
  messages: Message[]
}

export default function ExportPDF({ messages }: ExportPDFProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (messages.length === 0) return
    setLoading(true)

    try {
      const { default: jsPDF } = await import('jspdf')

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - margin * 2
      let yPos = margin

      const addPage = () => {
        doc.addPage()
        yPos = margin
        addHeader()
      }

      const checkNewPage = (height: number) => {
        if (yPos + height > pageHeight - margin) {
          addPage()
        }
      }

      const addHeader = () => {
        doc.setFillColor(0, 105, 62)
        doc.rect(0, 0, pageWidth, 18, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(11)
        doc.text('Saudi Electronic University - SEU Assistant', pageWidth / 2, 11, {
          align: 'center',
        })
        doc.setTextColor(0, 0, 0)
        yPos = 24
      }

      addHeader()

      doc.setFontSize(14)
      doc.setTextColor(0, 105, 62)
      doc.text('Conversation Export', pageWidth / 2, yPos, { align: 'center' })
      yPos += 6

      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      const dateStr = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date())
      doc.text(dateStr, pageWidth / 2, yPos, { align: 'center' })
      yPos += 8

      doc.setDrawColor(0, 105, 62)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 6

      const pairs: { question: string; answer: string; time: Date }[] = []
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].role === 'user' && messages[i + 1]?.role === 'assistant') {
          pairs.push({
            question: messages[i].content,
            answer: messages[i + 1].content,
            time: messages[i].timestamp,
          })
          i++
        }
      }

      pairs.forEach((pair, index) => {
        checkNewPage(20)

        doc.setFontSize(10)
        doc.setTextColor(0, 80, 47)
        doc.setFont('helvetica', 'bold')
        const qNum = `Q${index + 1}: `
        doc.text(qNum, margin, yPos)

        doc.setTextColor(30, 30, 30)
        doc.setFont('helvetica', 'normal')
        const questionLines = doc.splitTextToSize(pair.question, contentWidth - 15)
        doc.text(questionLines, margin + 12, yPos)
        yPos += questionLines.length * 5 + 3

        checkNewPage(10)

        const cleanAnswer = pair.answer
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,6}\s+/g, '')
          .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/^\|.*\|$/gm, (line) =>
            line
              .split('|')
              .filter(Boolean)
              .map((c) => c.trim())
              .join(' | ')
          )
          .replace(/^[-*]\s+/gm, '• ')
          .replace(/^\d+\.\s+/gm, (m) => m)
          .replace(/\n{3,}/g, '\n\n')
          .trim()

        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')

        const answerLines = doc.splitTextToSize(cleanAnswer, contentWidth)
        const maxLinesPerChunk = 40

        for (let i = 0; i < answerLines.length; i += maxLinesPerChunk) {
          const chunk = answerLines.slice(i, i + maxLinesPerChunk)
          checkNewPage(chunk.length * 4.5 + 5)
          doc.text(chunk, margin, yPos)
          yPos += chunk.length * 4.5
        }

        yPos += 4
        checkNewPage(2)
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.2)
        doc.line(margin, yPos, pageWidth - margin, yPos)
        yPos += 6
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalPages = (doc.internal as any).getNumberOfPages() as number
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `${i} / ${totalPages} | seu.edu.sa`,
          pageWidth / 2,
          pageHeight - 7,
          { align: 'center' }
        )
      }

      doc.save(`SEU-Chat-${Date.now()}.pdf`)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('حدث خطأ أثناء تصدير PDF. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const hasContent = messages.some((m) => m.role === 'assistant')

  return (
    <button
      onClick={handleExport}
      disabled={loading || !hasContent}
      title="تصدير المحادثة كملف PDF"
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${
        hasContent && !loading
          ? 'bg-seu-green text-white hover:bg-seu-green-dark active:scale-95 shadow-seu-green/20'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <FileDown size={16} />
      )}
      <span>{loading ? 'جاري التصدير...' : 'تصدير PDF'}</span>
    </button>
  )
}
