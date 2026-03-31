"use client"

import { useState, useRef, useEffect } from "react"
import { aiApi } from "@/lib/api"
import type { AiMode, ChatMessage, AiCitation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Send, Loader2, BookOpen, Lightbulb, HelpCircle, ClipboardCheck, CalendarDays, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface AiTutorProps {
  courseId: number | null
  lessonId: number
  lessonTitle: string
}

const modeLabels: Record<AiMode, { label: string; icon: React.ElementType }> = {
  explain: { label: "Объяснение", icon: Lightbulb },
  quiz: { label: "Квиз", icon: HelpCircle },
  check_homework: { label: "Проверка ДЗ", icon: ClipboardCheck },
  plan: { label: "План обучения", icon: CalendarDays },
}

const quickActions = [
  { label: "Объясни проще", mode: "explain" as AiMode, message: "Объясни тему этого урока простыми словами" },
  { label: "Дай пример", mode: "explain" as AiMode, message: "Приведи практический пример по теме урока" },
  { label: "Сделай квиз", mode: "quiz" as AiMode, message: "Сделай мини-квиз по теме урока" },
  { label: "Проверь мою домашку", mode: "check_homework" as AiMode, message: "Проверь мою домашнюю работу по этому уроку" },
]

export function AiTutor({ courseId, lessonId, lessonTitle }: AiTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<AiMode>("explain")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (text: string, overrideMode?: AiMode) => {
    if (!text.trim() || loading) return

    if (!courseId) {
      toast.error("Не удалось определить курс для этого урока. Попробуйте открыть урок из раздела курса.")
      return
    }

    const currentMode = overrideMode || mode
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      mode: currentMode,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const response = await aiApi.ask({
        course_id: courseId,
        lesson_id: lessonId,
        mode: currentMode,
        message: text,
      })

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response.answer,
        citations: response.citations,
        mode: currentMode,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка AI")
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "Произошла ошибка при обращении к AI. Попробуйте ещё раз.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Режим:</span>
        <Select value={mode} onValueChange={(v) => setMode(v as AiMode)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(modeLabels) as [AiMode, { label: string; icon: React.ElementType }][]).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <val.icon className="h-4 w-4" />
                  {val.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => sendMessage(action.message, action.mode)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Chat Messages */}
      <Card className="flex h-[400px] flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">AI-тьютор</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                {"Задайте вопрос по теме \""}{lessonTitle}{"\" или используйте быстрые кнопки выше."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-lg px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 rounded-md border bg-card p-3">
                        <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          Источники ответа
                        </p>
                        <div className="flex flex-col gap-1">
                          {msg.citations.map((c) => (
                            <CitationLink key={c.chunk_id} citation={c} />
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.mode && msg.role === "assistant" && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {modeLabels[msg.mode]?.label || msg.mode}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                      <User className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-lg bg-muted px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI думает...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Задайте вопрос..."
              rows={1}
              className="min-h-[40px] resize-none"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

function CitationLink({ citation }: { citation: AiCitation }) {
  return (
    <Link
      href={`/lessons/${citation.lesson_id}`}
      className="flex items-center gap-2 rounded px-2 py-1 text-xs text-primary hover:bg-muted transition-colors"
    >
      <ExternalLink className="h-3 w-3" />
      <span>{citation.title}</span>
      <span className="text-muted-foreground">({Math.round(citation.score * 100)}%)</span>
    </Link>
  )
}
