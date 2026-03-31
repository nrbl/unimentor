"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { coursesApi, assignmentsApi } from "@/lib/api"
import type { Course, ModuleWithLessons, Lesson, Assignment, ProgressSummary } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CourseProgressBar, ErrorState, PageSkeleton, StatusBadge } from "@/components/shared"
import { BookOpen, Circle, Clock, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = Number(params.courseId)
  const { user } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [modulesWithLessons, setModulesWithLessons] = useState<ModuleWithLessons[]>([])
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([])
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notAuthorized, setNotAuthorized] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      // First check if user is enrolled
      if (user) {
        const myCourses = await coursesApi.listMy()
        const isEnrolled = myCourses.some((c) => c.id === courseId)
        setEnrolled(isEnrolled)
      }

      const detail = await coursesApi.get(courseId)
      setCourse(detail.course)
      setModulesWithLessons(detail.modules || [])
      setProgressSummary(detail.progress_summary || null)

      // Gather all lessons and load assignments
      const allLessons = (detail.modules || []).flatMap((m) => m.lessons)
      const assignmentPromises = allLessons.map((l) => assignmentsApi.getByLesson(l.id))
      const allAssignments = (await Promise.all(assignmentPromises)).filter(Boolean) as Assignment[]
      setCourseAssignments(allAssignments)
    } catch (e) {
      const status = (e as any)?.status
      const msg = e instanceof Error ? e.message : "Ошибка загрузки"
      // If 403 — user is not authorized/enrolled in course
      if (status === 403) {
        setEnrolled(false)
        setNotAuthorized(true)
        // Try fetching without enrollment - fetch course list for basic info
        try {
          const allCourses = await coursesApi.listPublished()
          const found = allCourses.find((c) => c.id === courseId)
          if (found) setCourse(found)
        } catch {
          setError(msg)
        }
      } else if (msg.includes("NOT_ENROLLED") || msg.includes("403")) {
        setEnrolled(false)
        // Try fetching without enrollment - fetch course list for basic info
        try {
          const allCourses = await coursesApi.listPublished()
          const found = allCourses.find((c) => c.id === courseId)
          if (found) setCourse(found)
        } catch {
          setError(msg)
        }
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user])

  const handleEnroll = async () => {
    if (!user) return
    setEnrolling(true)
    try {
      await coursesApi.enroll(courseId)
      setEnrolled(true)
      toast.success("Вы записаны на курс!")
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка записи")
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>
  if (notAuthorized)
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Главная</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/catalog">Каталог</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course?.title || "Курс"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-8 rounded-lg border bg-muted p-6 text-center">
          <h2 className="text-lg font-semibold">Доступ ограничен</h2>
          <p className="mt-2 text-sm text-muted-foreground">Вы не записаны на этот курс или у вас нет доступа.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {user ? (
              <Button onClick={handleEnroll} disabled={enrolling} size="lg">
                {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Записаться на курс
              </Button>
            ) : (
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">Войдите, чтобы записаться</Link>
            )}
          </div>
        </div>
      </div>
    )
  if (!course) return null

  const allLessons = modulesWithLessons.flatMap((m) => m.lessons)
  const totalLessons = progressSummary?.total_lessons ?? allLessons.length
  const completedLessons = progressSummary?.completed_lessons ?? 0
  const coursePercent = progressSummary?.progress_percent ?? 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/catalog">Каталог</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Course Header */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground text-balance">{course.title}</h1>
            <StatusBadge status={course.status} />
          </div>
          <p className="mt-2 text-muted-foreground">{course.description}</p>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {totalLessons} уроков</span>
            <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {courseAssignments.length} заданий</span>
            <Badge variant="outline">{course.language.toUpperCase()}</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {!enrolled ? (
            <Button onClick={handleEnroll} disabled={enrolling} size="lg">
              {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Записаться на курс
            </Button>
          ) : (
            <Card className="w-full lg:w-64">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground">Ваш прогресс</p>
                <CourseProgressBar percent={coursePercent} className="mt-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {completedLessons} из {totalLessons} уроков пройдено
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modules & Lessons */}
      {modulesWithLessons.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">Программа курса</h2>
          <Accordion type="multiple" defaultValue={modulesWithLessons.map((m) => String(m.module.id))} className="mt-4">
            {modulesWithLessons.map((mwl) => {
              const modLessons = mwl.lessons
              return (
                <AccordionItem key={mwl.module.id} value={String(mwl.module.id)}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mwl.module.title}</span>
                      <Badge variant="secondary" className="text-xs">{modLessons.length} уроков</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1 pl-1">
                      {modLessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={enrolled ? `/lessons/${lesson.id}` : "#"}
                          onClick={(e) => {
                            if (!enrolled) {
                              e.preventDefault()
                              toast.info("Запишитесь на курс, чтобы открыть урок")
                            }
                          }}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                        >
                          <Circle className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-foreground">{lesson.title}</span>
                          {!lesson.is_published && (
                            <Badge variant="outline" className="text-xs">Черновик</Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      )}

      {/* Assignments Section */}
      {courseAssignments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">Задания</h2>
          <div className="mt-4 flex flex-col gap-2">
            {courseAssignments.map((a) => {
              const lesson = allLessons.find((l) => l.id === a.lesson_id)
              return (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground">{a.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson ? `Урок: ${lesson.title}` : ""} | Макс. балл: {a.max_score}
                      </p>
                    </div>
                    {a.due_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(a.due_at).toLocaleDateString("ru-RU")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
