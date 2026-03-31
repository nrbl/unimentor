"use client"

import { useState } from "react"
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
  const [submitting, setSubmitting] = useState(false)

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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={submission.status} />
                <span className="text-xs text-muted-foreground">
                  {new Date(submission.created_at).toLocaleString("ru-RU")}
                </span>
              </div>
              {submission.score !== null && (
                <Badge variant="default">{submission.score}/{assignment.max_score}</Badge>
              )}
            </div>
            <pre className="mt-3 max-h-32 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">{submission.answer_text}</pre>

            {(submission.ai_feedback || submission.teacher_feedback) && (
              <>
                <Separator className="my-3" />
                {submission.ai_feedback && (
                  <div className="flex gap-2 rounded-md bg-primary/5 p-3">
                    <Bot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-medium text-primary">AI-обратная связь</p>
                      <p className="mt-1 text-sm text-foreground">{submission.ai_feedback}</p>
                    </div>
                  </div>
                )}
                {submission.teacher_feedback && (
                  <div className="mt-2 flex gap-2 rounded-md bg-accent/10 p-3">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div>
                      <p className="text-xs font-medium text-accent">Преподаватель</p>
                      <p className="mt-1 text-sm text-foreground">{submission.teacher_feedback}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
