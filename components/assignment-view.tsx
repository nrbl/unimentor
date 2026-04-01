"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { assignmentsApi } from "@/lib/api"
import type { Assignment, Submission } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/shared"
import { Clock, Send, Loader2, FileText, CheckCircle2, Bot, User } from "lucide-react"
import { toast } from "sonner"

interface AssignmentViewProps {
  assignment: Assignment
}

export function AssignmentView({ assignment }: AssignmentViewProps) {
  const { user } = useAuth()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [answerText, setAnswerText] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadSubmission = async () => {
      setLoading(true)
      try {
        const sub = await assignmentsApi.getSubmission(assignment.id)
        setSubmission(sub)
      } catch (e) {
        console.error("Error loading submission:", e)
      } finally {
        setLoading(false)
      }
    }
    loadSubmission()
  }, [assignment.id])

  const handleSubmit = async () => {
    if (!user) return
    if (!answerText.trim()) {
      toast.error("Введите ответ")
      return
    }
    setSubmitting(true)
    try {
      const sub = await assignmentsApi.submit(assignment.id, {
        answer_text: answerText,
      })
      setSubmission(sub)
      setAnswerText("")
      toast.success("Работа отправлена на проверку!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка отправки")
    } finally {
      setSubmitting(false)
    }
  }

  const isPastDue = assignment.due_at ? new Date(assignment.due_at) < new Date() : false

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
        <p className="mt-4 text-sm text-muted-foreground">Загрузка задания...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {assignment.title}
            </CardTitle>
            {assignment.due_at && (
              <Badge variant={isPastDue ? "destructive" : "outline"} className="shrink-0">
                <Clock className="mr-1 h-3 w-3" />
                {isPastDue ? "Срок истёк" : `До ${new Date(assignment.due_at).toLocaleDateString("ru-RU")}`}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-foreground">{assignment.description}</p>
          {assignment.rubric && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Критерии оценки:</p>
              <p className="text-sm text-muted-foreground">{assignment.rubric}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">Максимальный балл: <span className="font-medium text-foreground">{assignment.max_score}</span></p>
        </CardContent>
      </Card>

      {/* Submit Form */}
      {!submission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Отправить работу</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-lg bg-amber-500/5 p-4 text-xs text-amber-600 border border-amber-500/10 mb-2">
              Совет: Вы можете вставить текст ответа или ссылку на ваш проект.
            </div>
            <Textarea
              placeholder="Введите ваш ответ или вставьте код..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting || !answerText.trim()}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Отправить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Result */}
      {submission && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="pb-3 border-b">
             <CardTitle className="text-base flex items-center justify-between">
                <span>Ваше решение</span>
                <div className="flex items-center gap-2">
                   <StatusBadge status={submission.status} />
                   {submission.score !== null && (
                     <Badge variant="default" className="bg-primary text-primary-foreground font-bold">
                        {submission.score} / {assignment.max_score}
                     </Badge>
                   )}
                </div>
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <span className="text-xs text-muted-foreground block mb-2">
               Дата отправки: {new Date(submission.created_at).toLocaleString("ru-RU")}
            </span>
            <pre className="max-h-60 overflow-auto rounded-md bg-muted p-4 text-sm text-foreground whitespace-pre-wrap font-mono">
              {submission.answer_text}
            </pre>

            {(submission.ai_feedback || submission.teacher_feedback) && (
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Обратная связь</h4>
                {submission.ai_feedback && (
                  <div className="flex gap-4 rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-tight">AI-тьютор</p>
                      <p className="mt-1 text-sm text-foreground leading-relaxed italic">{submission.ai_feedback}</p>
                    </div>
                  </div>
                )}
                {submission.teacher_feedback && (
                  <div className="flex gap-4 rounded-xl bg-indigo-500/5 p-4 border border-indigo-500/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-tight">Преподаватель</p>
                      <p className="mt-1 text-sm text-foreground font-medium">{submission.teacher_feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
