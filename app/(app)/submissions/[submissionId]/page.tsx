"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { submissionsApi } from "@/lib/api"
import type { Submission } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ErrorState, PageSkeleton, StatusBadge } from "@/components/shared"
import { Bot, User, FileText } from "lucide-react"

export default function SubmissionDetailPage() {
  const params = useParams()
  const submissionId = Number(params.submissionId)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await submissionsApi.get(submissionId)
      setSubmission(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId])

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>
  if (!submission) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Результат сдачи</h1>
      <div className="mt-2 flex items-center gap-3">
        <StatusBadge status={submission.status} />
        {submission.score !== null && <Badge variant="default">Балл: {submission.score}</Badge>}
        <span className="text-sm text-muted-foreground">
          {new Date(submission.created_at).toLocaleString("ru-RU")}
        </span>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Ваш ответ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md bg-muted p-4 text-sm text-foreground">{submission.answer_text}</pre>
          {submission.attachments.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Вложения:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {submission.attachments.map((a, i) => (
                  <Badge key={i} variant="outline">{a}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {submission.ai_feedback && (
        <Card className="mt-4">
          <CardContent className="flex gap-3 p-5">
            <Bot className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">AI-обратная связь</p>
              <p className="mt-1 text-sm text-foreground">{submission.ai_feedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {submission.teacher_feedback && (
        <Card className="mt-4">
          <CardContent className="flex gap-3 p-5">
            <User className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-medium text-accent">Преподаватель</p>
              <p className="mt-1 text-sm text-foreground">{submission.teacher_feedback}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
