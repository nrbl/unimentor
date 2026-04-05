"use client"

import dynamic from "next/dynamic"
import React, { useState, useRef, useEffect } from "react"
import { aiApi } from "@/lib/api"
import type { AiMode, ChatMessage, AiCitation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Send,
  Loader2,
  BookOpen,
  Lightbulb,
  HelpCircle,
  ClipboardCheck,
  CalendarDays,
  ExternalLink,
  Trophy,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const TutorAvatar3D = dynamic(
  () => import("@/components/tutor-avatar-3d").then((m) => m.TutorAvatar3D),
  { ssr: false }
)

function speakingDurationMs(text: string) {
  return Math.min(16000, Math.max(2000, text.length * 42))
}

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

const AI_MODE_ORDER: AiMode[] = ["explain", "quiz", "check_homework", "plan"]

export function AiTutor({ courseId, lessonId, lessonTitle }: AiTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [mode, setMode] = useState<AiMode>("explain")
  const [loading, setLoading] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleSpeakEnd = (msgId: string, durationMs: number) => {
    if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current)
    speakTimeoutRef.current = setTimeout(() => {
      setSpeakingMsgId((id) => (id === msgId ? null : id))
      speakTimeoutRef.current = null
    }, durationMs)
  }

  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

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

    setSpeakingMsgId(null)
    try {
      let enhancedMessage = text
      if (currentMode === "explain") {
        enhancedMessage = `[SYSTEM: Отвечай строго, используя метод Сократа. НЕ давай прямой или полный ответ сразу. Вместо этого задай короткий НАВОДЯЩИЙ ВОПРОС, чтобы заставить студента подумать и прийти к ответу самостоятельно. Будь кратким и поддерживающим.]\n\nВопрос студента: ${text}`
      }

      const response = await aiApi.ask({
        course_id: courseId,
        lesson_id: lessonId,
        mode: currentMode,
        message: enhancedMessage,
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
      setSpeakingMsgId(aiMsg.id)
      scheduleSpeakEnd(aiMsg.id, speakingDurationMs(response.answer))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка AI")
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "Произошла ошибка при обращении к AI. Попробуйте ещё раз.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
      setSpeakingMsgId(errorMsg.id)
      scheduleSpeakEnd(errorMsg.id, speakingDurationMs(errorMsg.content))
    } finally {
      setLoading(false)
      
      // Simulate real-time skill assessment / Matrix Update
      if (currentMode === "quiz" && text.length > 3) {
        setTimeout(() => {
          toast.success("Отличный ответ! ИИ обновил вашу Матрицу Навыков.", {
            description: "+5% к параметру 'Основы Python'",
            icon: <Trophy className="h-4 w-4 text-amber-500" />
          })
        }, 2000)
      }
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

  const tutorSpeaking = loading || speakingMsgId !== null

  return (
    <div className="flex flex-col gap-3">
      <Card className="overflow-hidden border-border/60 shadow-sm ring-1 ring-border/40">
        <div className="flex min-h-[min(420px,70vh)] flex-col lg:min-h-[440px] lg:flex-row">
          <aside className="flex flex-col items-center gap-3 border-b border-border/50 bg-gradient-to-b from-primary/[0.07] via-muted/20 to-muted/35 px-4 py-5 lg:w-[min(100%,292px)] lg:shrink-0 lg:border-b-0 lg:border-r lg:py-6">
            <TutorAvatar3D
              size="xl"
              speaking={tutorSpeaking}
              className="shadow-md ring-1 ring-black/[0.06]"
            />
            <div className="w-full text-center lg:text-left">
              <p className="text-sm font-semibold leading-tight text-foreground">AI-тьютор</p>
              <p className="mt-1 line-clamp-3 text-xs leading-snug text-muted-foreground">
                Урок: «{lessonTitle}»
              </p>
            </div>
            {tutorSpeaking && (
              <div
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                aria-live="polite"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    Думаю над ответом…
                  </>
                ) : (
                  <>Говорю — смотрите на аватар</>
                )}
              </div>
            )}
            <p className="hidden text-center text-[11px] leading-relaxed text-muted-foreground lg:block">
              Задайте вопрос справа или выберите подсказку — ответ появится в чате.
            </p>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex flex-col gap-2 border-b border-border/50 bg-muted/15 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-xs font-medium text-muted-foreground">Режим</span>
                <Select value={mode} onValueChange={(v) => setMode(v as AiMode)}>
                  <SelectTrigger className="h-9 w-full min-w-[140px] max-w-[220px] sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODE_ORDER.map((key) => {
                      const val = modeLabels[key]
                      return (
                        <SelectItem key={key} value={key} textValue={val.label}>
                          <span className="flex items-center gap-2">
                            {React.createElement(val.icon, { className: "h-4 w-4 shrink-0" })}
                            {val.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 sm:flex-wrap sm:overflow-visible">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 whitespace-nowrap text-xs"
                    disabled={loading}
                    onClick={() => sendMessage(action.message, action.mode)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            <div
              ref={scrollRef}
              className="min-h-[220px] flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4"
              role="log"
              aria-label="Диалог с тьютором"
            >
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-2 text-center">
                  <MessageCircle className="h-9 w-9 text-muted-foreground/35" strokeWidth={1.25} />
                  <p className="text-sm font-medium text-foreground">Начните диалог</p>
                  <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                    Напишите вопрос внизу или нажмите быструю подсказку. Ответ появится здесь, а тьютор слева
                    покажет речь.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[min(100%,520px)] ${msg.role === "user" ? "order-1" : ""}`}>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                            msg.role === "user"
                              ? "rounded-tr-md bg-primary text-primary-foreground"
                              : "rounded-tl-md border border-border/50 bg-muted/50 text-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-2 rounded-lg border border-border/60 bg-card p-2.5">
                            <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <BookOpen className="h-3 w-3" />
                              Источники ответа
                            </p>
                            <div className="flex flex-col gap-0.5">
                              {msg.citations.map((c) => (
                                <CitationLink key={c.chunk_id} citation={c} />
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.mode && msg.role === "assistant" && (
                          <div className="mt-1.5">
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {modeLabels[msg.mode]?.label || msg.mode}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="order-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                          <User className="h-4 w-4 text-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-md border border-border/50 bg-muted/50 px-3.5 py-2.5 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                          Готовлю ответ…
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-border/50 bg-background/80 p-3 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Вопрос по уроку…"
                  rows={1}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-primary/30"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl"
                  disabled={loading || !input.trim()}
                  aria-label="Отправить"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground sm:text-left">
                Enter — отправить · Shift+Enter — новая строка
              </p>
            </div>
          </div>
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
