"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { teacherApi } from "@/lib/api"
import type { Submission, User } from "@/lib/types"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ErrorState, PageSkeleton, StatusBadge, EmptyState } from "@/components/shared"
import { FileText, User as UserIcon, Send, Loader2, CheckCircle2, Clock, Award } from "lucide-react"
import { toast } from "sonner"

function SubmissionCard({ 
  submission, 
  onGraded 
}: { 
  submission: Submission & { student: User }, 
  onGraded: (updated: Submission) => void 
}) {
  const [score, setScore] = useState(submission.score?.toString() || "")
  const [feedback, setFeedback] = useState(submission.teacher_feedback || "")
  const [loading, setLoading] = useState(false)

  const handleGrade = async () => {
    if (!score) {
      toast.error("Пожалуйста, введите оценку")
      return
    }
    setLoading(true)
    try {
      const updated = await teacherApi.gradeSubmission(submission.id, {
        score: parseInt(score),
        teacher_feedback: feedback
      })
      toast.success(`Работа ${submission.student.full_name} успешно оценена!`, {
         icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
      })
      onGraded({ ...submission, ...updated })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка при сохранении оценки")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden border-primary/20 shadow-md hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Submission Info */}
          <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-border/50 bg-background/50">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                  <UserIcon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{submission.student.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{submission.student.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={submission.status} />
                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">
                   Отправлено: {new Date(submission.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-xs text-primary uppercase tracking-widest font-black flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Ответ студента
              </Label>
              <div className="relative group/code">
                 <pre className="max-h-80 overflow-auto rounded-xl border bg-muted/40 p-5 text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed shadow-inner">
                   {submission.answer_text}
                 </pre>
                 <div className="absolute top-3 right-3 opacity-0 group-hover/code:opacity-100 transition-opacity">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">TXT</Badge>
                 </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dashed flex justify-between items-center text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
              <span>System ID: {submission.id}</span>
              <span className="flex items-center gap-1">
                 <Clock className="w-3 h-3" />
                 {new Date(submission.created_at).toLocaleTimeString("ru-RU")}
              </span>
            </div>
          </div>

          {/* Grading Panel */}
          <div className="w-full md:w-96 bg-primary/5 dark:bg-muted/10 p-8 flex flex-col gap-8 relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Award className="h-32 w-32" />
            </div>
            
            <div className="relative z-10">
              <Label className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black mb-3 block">
                Выставить Баллы
              </Label>
              <div className="flex items-end gap-3">
                 <Input 
                   type="number" 
                   placeholder="0" 
                   value={score} 
                   onChange={(e) => setScore(e.target.value)} 
                   className="w-24 bg-background border-primary/20 text-2xl font-black h-16 text-center focus:ring-primary shadow-sm"
                 />
                 <span className="text-muted-foreground text-sm font-bold mb-4 opacity-50">/ Макс. возможный</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col relative z-10">
              <Label className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-3 block">
                Развёрнутая Обратная Связь
              </Label>
              <Textarea 
                placeholder="Что студент сделал хорошо? Что стоит улучшить?" 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)}
                className="flex-1 min-h-[160px] w-full resize-none bg-background mb-6 shadow-sm border-muted-foreground/20 italic text-sm"
              />
              <Button 
                onClick={handleGrade} 
                disabled={loading || !score} 
                className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                {submission.status === "reviewed" ? "Обновить данные" : "Подтвердить оценку"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SubmissionsListContent() {
  const params = useParams()
  const assignmentId = Number(params.assignmentId)
  const [submissions, setSubmissions] = useState<(Submission & { student: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await teacherApi.listSubmissions(assignmentId)
      setSubmissions(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId])

  const handleSubGraded = (updated: Submission) => {
    setSubmissions(prev => 
      prev.map(s => s.id === updated.id ? { ...s, ...updated } : s)
    )
  }

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/teacher">Дашборд</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/teacher/courses">Мои курсы</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Проверка заданий</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2 mb-8">
         <h1 className="text-3xl font-bold tracking-tight text-foreground">Работы студентов</h1>
         <p className="text-muted-foreground">Проверяйте ответы и оставляйте обратную связь.</p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState 
           icon={FileText} 
           title="Нет новых ответов" 
           description="Студенты ещё не отправили решения по этому заданию." 
        />
      ) : (
        <div className="flex flex-col gap-6">
          {submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} onGraded={handleSubGraded} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TeacherSubmissionsPage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <SubmissionsListContent />
    </RouteGuard>
  )
}
