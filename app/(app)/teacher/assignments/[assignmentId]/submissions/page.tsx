"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { teacherApi } from "@/lib/api"
import type { Submission, User } from "@/lib/types"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ErrorState, PageSkeleton, StatusBadge, EmptyState } from "@/components/shared"
import { FileText, User as UserIcon } from "lucide-react"

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

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/teacher">Мои курсы</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Сдачи задания</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mt-4 text-2xl font-bold text-foreground">Сдачи задания</h1>

      {submissions.length === 0 ? (
        <EmptyState icon={FileText} title="Нет сдач" description="Студенты ещё не отправляли работы" />
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {submissions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub.student.full_name}</p>
                      <p className="text-xs text-muted-foreground">{sub.student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={sub.status} />
                    {sub.score !== null && <Badge>{sub.score} баллов</Badge>}
                  </div>
                </div>
                <pre className="mt-3 max-h-24 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">
                  {sub.answer_text}
                </pre>
                <p className="mt-2 text-xs text-muted-foreground">
                  Отправлено: {new Date(sub.created_at).toLocaleString("ru-RU")}
                </p>
              </CardContent>
            </Card>
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
