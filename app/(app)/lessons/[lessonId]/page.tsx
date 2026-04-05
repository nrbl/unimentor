"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { lessonsApi, assignmentsApi, coursesApi } from "@/lib/api"
import type { Lesson, LessonBlock, Assignment, LessonProgress } from "@/lib/types"
import { LessonBlockRenderer } from "@/components/lesson-block-renderer"
import { AssignmentView } from "@/components/assignment-view"
import { AiTutor } from "@/components/ai-tutor"
import { ErrorState, PageSkeleton } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Loader2, BookOpen, PenLine, Bot } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

/** Parse block data: the backend may return `data` as a JSON string */
function parseBlockData(block: LessonBlock): LessonBlock {
  if (typeof block.data === "string") {
    try {
      return { ...block, data: JSON.parse(block.data) }
    } catch {
      return { ...block, data: { content: block.data } }
    }
  }
  return block
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = Number(params.lessonId)
  const { user } = useAuth()
  const { t } = useLocale()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [blocks, setBlocks] = useState<LessonBlock[]>([])
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("material")
  // We don't get course/module info from the lesson endpoint, so track the IDs
  const [courseId, setCourseId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [lessonData, assignData] = await Promise.all([
        lessonsApi.get(lessonId),
        assignmentsApi.getByLesson(lessonId),
      ])
      setLesson(lessonData.lesson)
      setBlocks((lessonData.blocks || []).map(parseBlockData))
      setLessonProgress(lessonData.progress || null)
      setAssignment(assignData)
      // Derive courseId from module info if available
      if (lessonData.lesson.module_id) {
        // First check enrolled courses (much faster)
        coursesApi.listMy()
          .then(myCourses => {
            const found = myCourses.find(c => c.id === lessonId /* this is likely wrong, let's just scan detail */)
            // Actually, we should just scan the courses we have access to
            for (const c of myCourses) {
              coursesApi.get(c.id).then(detail => {
                if (detail.modules.find(m => m.module.id === lessonData.lesson.module_id)) {
                  setCourseId(c.id)
                }
              }).catch(() => {})
            }
          })
          .catch(() => {
            // Fallback to published if needed
            coursesApi.listPublished().then(pubCourses => {
              for (const c of pubCourses) {
                coursesApi.get(c.id).then(detail => {
                  if (detail.modules.find(m => m.module.id === lessonData.lesson.module_id)) {
                    setCourseId(c.id)
                  }
                }).catch(() => {})
              }
            }).catch(() => {})
          })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    load()
  }, [load])

  const handleComplete = async () => {
    if (!user) return
    setCompleting(true)
    try {
      const result = await lessonsApi.complete(lessonId)
      setLessonProgress(result.progress || null)
      toast.success("Урок отмечен как пройденный!")
      router.refresh() // Invalidate cache to show updated progress on the Course page
      
      // Auto-navigate to next lesson or back to course
      if (courseId) {
        try {
           const detail = await coursesApi.get(courseId)
           const allLessons = (detail.modules || []).flatMap(m => m.lessons)
           const currentIndex = allLessons.findIndex(l => l.id === lessonId)
           if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
             const nextLesson = allLessons[currentIndex + 1]
             setTimeout(() => {
               toast.info("Переходим к следующему уроку...")
               router.push(`/lessons/${nextLesson.id}`)
             }, 1500)
           } else {
             setTimeout(() => {
               toast.info("Возвращаемся к содержанию курса...")
               router.push(`/courses/${courseId}`)
             }, 1500)
           }
        } catch {
           // Silently fail if course scan errors out
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>
  if (!lesson) return null

  const isCompleted = lessonProgress?.status === "completed"
  const progressPercent = isCompleted ? 100 : (lessonProgress?.progress_percent || 0)
  const objectives = lesson.objectives || ""

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t("nav.home", "Home")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
          {objectives && (
            <p className="mt-1 text-sm text-muted-foreground">
              {"Цели: "}{objectives}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-1.5 rounded-md bg-[hsl(var(--success))]/10 px-3 py-1.5 text-sm font-medium text-[hsl(var(--success))]">
              <CheckCircle2 className="h-4 w-4" />
              {t("lesson.completed", "Completed")}
            </div>
          ) : (
            <Button onClick={handleComplete} disabled={completing} variant="outline">
              {completing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              {t("lesson.markComplete", "Mark as completed")}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-2">
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full justify-start">
          <TabsTrigger value="material" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            {t("tabs.material", "Material")}
          </TabsTrigger>
          <TabsTrigger value="homework" className="gap-1.5" disabled={!assignment}>
            <PenLine className="h-4 w-4" />
            {t("tabs.homework", "Homework")}
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Bot className="h-4 w-4" />
            {t("tabs.ai", "AI Tutor")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="material" className="mt-6">
          {blocks.length > 0 ? (
            <LessonBlockRenderer blocks={blocks} />
          ) : (
            <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
              Материалы для этого урока ещё не добавлены.
            </div>
          )}
        </TabsContent>

        <TabsContent value="homework" className="mt-6">
          {assignment ? (
            <AssignmentView assignment={assignment} />
          ) : (
            <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
              Домашнее задание для этого урока отсутствует.
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AiTutor courseId={courseId} lessonId={lesson.id} lessonTitle={lesson.title} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
