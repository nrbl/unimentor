"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { coursesApi, teacherApi } from "@/lib/api"
import type { Course, Module, Lesson, Assignment } from "@/lib/types"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { ErrorState, PageSkeleton, StatusBadge, EmptyState } from "@/components/shared"
import {
  ArrowLeft, Save, Loader2, Plus, Settings, BookOpen, Database, FileText, Eye,
  GripVertical, Pencil, Upload, Zap, Clock
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function CourseEditorContent() {
  const params = useParams()
  const courseId = Number(params.courseId)
  const { user } = useAuth()
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [mods, setMods] = useState<Module[]>([])
  const [lessonsList, setLessonsList] = useState<Lesson[]>([])
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([])
  const [materialsList, setMaterialsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("settings")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [language, setLanguage] = useState("ru")
  const [status, setStatus] = useState<"draft" | "published">("draft")

  // Module creation
  const [newModTitle, setNewModTitle] = useState("")
  const [creatingModule, setCreatingModule] = useState(false)
  // Lesson creation
  const [newLessonModId, setNewLessonModId] = useState("")
  const [newLessonTitle, setNewLessonTitle] = useState("")
  const [creatingLesson, setCreatingLesson] = useState(false)
  // Assignment creation
  const [newAssLessonId, setNewAssLessonId] = useState("")
  const [newAssTitle, setNewAssTitle] = useState("")
  const [newAssDesc, setNewAssDesc] = useState("")
  const [newAssMaxScore, setNewAssMaxScore] = useState("10")
  const [creatingAssignment, setCreatingAssignment] = useState(false)
  // Material creation
  const [newMatLessonId, setNewMatLessonId] = useState("")
  const [newMatText, setNewMatText] = useState("")
  const [creatingMaterial, setCreatingMaterial] = useState(false)
  const [ingestingId, setIngestingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const detail = await coursesApi.get(courseId)
      setCourse(detail.course)
      // Flatten modules
      const flatMods = (detail.modules || []).map((m) => m.module)
      const flatLessons = (detail.modules || []).flatMap((m) => m.lessons)
      setMods(flatMods)
      setLessonsList(flatLessons)
      setTitle(detail.course.title)
      setDescription(detail.course.description)
      setLanguage(detail.course.language)
      setStatus(detail.course.status)

      // Load assignments
      const { assignmentsApi: assApi } = await import("@/lib/api")
      const allAssPromises = flatLessons.map((l) => assApi.getByLesson(l.id))
      const allAss = (await Promise.all(allAssPromises)).filter(Boolean) as Assignment[]
      setAssignmentsList(allAss)
      // Load materials for all lessons in this course (teacher endpoint may support listing by lesson)
      try {
        const matsPerLesson = await Promise.all(
          flatLessons.map((l) =>
            teacherApi.listMaterials(l.id).catch(() => [])
          )
        )
        const allMats = matsPerLesson.flat()
        setMaterialsList(allMats)
      } catch {
        // keep empty list on error
        setMaterialsList([])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await teacherApi.updateCourse(courseId, { title, description, language, status })
      setCourse(updated)
      toast.success("Курс сохранён")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const handleCreateModule = async () => {
    if (!newModTitle.trim()) return
    setCreatingModule(true)
    try {
      const mod = await teacherApi.createModule({ course_id: courseId, title: newModTitle })
      setMods((prev) => [...prev, mod])
      setNewModTitle("")
      toast.success("Модуль создан")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setCreatingModule(false)
    }
  }

  const handleCreateLesson = async () => {
    if (!newLessonModId || !newLessonTitle.trim()) return
    setCreatingLesson(true)
    try {
  const lesson = await teacherApi.createLesson({ module_id: Number(newLessonModId), title: newLessonTitle })
      setLessonsList((prev) => [...prev, lesson])
      setNewLessonTitle("")
      toast.success("Урок создан")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setCreatingLesson(false)
    }
  }

  const handleCreateAssignment = async () => {
    if (!newAssLessonId || !newAssTitle.trim()) return
    setCreatingAssignment(true)
    try {
      const a = await teacherApi.createAssignment({
        lesson_id: Number(newAssLessonId),
        title: newAssTitle,
        description: newAssDesc,
        max_score: parseInt(newAssMaxScore) || 10,
        rubric: null,
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      setAssignmentsList((prev) => [...prev, a])
      setNewAssTitle("")
      setNewAssDesc("")
      toast.success("Задание создано")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setCreatingAssignment(false)
    }
  }

  const handleCreateMaterial = async () => {
    if (!user || !newMatLessonId || !newMatText.trim()) return
    setCreatingMaterial(true)
    try {
      const mat = await teacherApi.createMaterial({
        lesson_id: Number(newMatLessonId),
        type: "text",
        source_text: newMatText,
      })
      setMaterialsList((prev) => [...prev, mat])
      setNewMatText("")
      toast.success("Материал добавлен")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setCreatingMaterial(false)
    }
  }

  const handleIngest = async (materialId: number) => {
    setIngestingId(materialId)
    try {
      const mat = await teacherApi.runIngest(materialId)
      setMaterialsList((prev) => prev.map((m) => (m.id === materialId ? mat : m)))
      toast.success("Материал обработан для AI")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка ингеста")
    } finally {
      setIngestingId(null)
    }
  }

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>
  if (!course) return null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
          <StatusBadge status={course.status} />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-4 w-4" /> Настройки</TabsTrigger>
          <TabsTrigger value="program" className="gap-1.5"><BookOpen className="h-4 w-4" /> Программа</TabsTrigger>
          <TabsTrigger value="materials" className="gap-1.5"><Database className="h-4 w-4" /> Материалы и AI</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5"><FileText className="h-4 w-4" /> Задания</TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5"><Eye className="h-4 w-4" /> Просмотр</TabsTrigger>
        </TabsList>

        {/* Settings */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex flex-col gap-2">
                <Label>Название курса</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Описание</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Язык</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Статус</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="published">Опубликован</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Program */}
        <TabsContent value="program" className="mt-6">
          <div className="flex flex-col gap-6">
            {/* Create Module */}
            <Card>
              <CardContent className="flex items-end gap-3 pt-6">
                <div className="flex flex-1 flex-col gap-2">
                  <Label>Новый модуль</Label>
                  <Input placeholder="Название модуля" value={newModTitle} onChange={(e) => setNewModTitle(e.target.value)} />
                </div>
                <Button onClick={handleCreateModule} disabled={creatingModule || !newModTitle.trim()}>
                  {creatingModule ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Добавить
                </Button>
              </CardContent>
            </Card>

            {/* Create Lesson */}
            <Card>
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-2 sm:w-48">
                  <Label>Модуль</Label>
                  <Select value={newLessonModId} onValueChange={setNewLessonModId}>
                    <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                    <SelectContent>
                      {mods.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <Label>Новый урок</Label>
                  <Input placeholder="Название урока" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
                </div>
                <Button onClick={handleCreateLesson} disabled={creatingLesson || !newLessonModId || !newLessonTitle.trim()}>
                  {creatingLesson ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Добавить
                </Button>
              </CardContent>
            </Card>

            {/* Modules & Lessons */}
            <Accordion type="multiple" defaultValue={mods.map((m) => String(m.id))}>
              {mods.map((mod) => {
                const modLessons = lessonsList.filter((l) => l.module_id === mod.id)
                return (
                  <AccordionItem key={mod.id} value={String(mod.id)}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{mod.title}</span>
                        <Badge variant="secondary" className="text-xs">{modLessons.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {modLessons.length === 0 ? (
                        <p className="py-3 text-center text-sm text-muted-foreground">Нет уроков</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {modLessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/teacher/lessons/${lesson.id}/edit`}
                              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1 text-foreground">{lesson.title}</span>
                              {!lesson.is_published && <Badge variant="outline" className="text-xs">Черновик</Badge>}
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>

            {mods.length === 0 && (
              <EmptyState icon={BookOpen} title="Нет модулей" description="Создайте первый модуль для курса" />
            )}
          </div>
        </TabsContent>

        {/* Materials & AI */}
        <TabsContent value="materials" className="mt-6">
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                  <div className="flex flex-col gap-2 sm:w-48">
                    <Label>Урок</Label>
                    <Select value={newMatLessonId} onValueChange={setNewMatLessonId}>
                      <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                      <SelectContent>
                        {lessonsList.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Textarea placeholder="Текст материала для AI..." value={newMatText} onChange={(e) => setNewMatText(e.target.value)} rows={3} />
                <Button onClick={handleCreateMaterial} disabled={creatingMaterial || !newMatLessonId || !newMatText.trim()} className="self-start">
                  {creatingMaterial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Загрузить материал
                </Button>
              </CardContent>
            </Card>

            <h3 className="text-sm font-medium text-foreground">Загруженные материалы</h3>
            {materialsList.length === 0 ? (
              <EmptyState icon={Database} title="Нет материалов" description="Загрузите материалы для AI-тьютора" />
            ) : (
              <div className="flex flex-col gap-2">
                {materialsList.map((mat) => {
                  const lesson = lessonsList.find((l) => l.id === mat.lesson_id)
                  return (
                    <Card key={mat.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{mat.type === "text" ? "Текст" : mat.file_url}</p>
                          <p className="text-xs text-muted-foreground">Урок: {lesson?.title || mat.lesson_id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={mat.status} />
                          {mat.status !== "ingested" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleIngest(mat.id)}
                              disabled={ingestingId === mat.id}
                            >
                              {ingestingId === mat.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Zap className="mr-1 h-3 w-3" />}
                              Ингест
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="mt-6">
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label>Урок</Label>
                    <Select value={newAssLessonId} onValueChange={setNewAssLessonId}>
                      <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                      <SelectContent>
                        {lessonsList.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Макс. балл</Label>
                    <Input type="number" value={newAssMaxScore} onChange={(e) => setNewAssMaxScore(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Название задания</Label>
                  <Input placeholder="Задание: ..." value={newAssTitle} onChange={(e) => setNewAssTitle(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Описание</Label>
                  <Textarea placeholder="Опишите задание..." value={newAssDesc} onChange={(e) => setNewAssDesc(e.target.value)} rows={2} />
                </div>
                <Button onClick={handleCreateAssignment} disabled={creatingAssignment || !newAssLessonId || !newAssTitle.trim()} className="self-start">
                  {creatingAssignment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Создать задание
                </Button>
              </CardContent>
            </Card>

            {assignmentsList.length === 0 ? (
              <EmptyState icon={FileText} title="Нет заданий" description="Создайте первое задание" />
            ) : (
              <div className="flex flex-col gap-2">
                {assignmentsList.map((a) => {
                  const lesson = lessonsList.find((l) => l.id === a.lesson_id)
                  return (
                    <Card key={a.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-foreground">{a.title}</p>
                          <p className="text-xs text-muted-foreground">Урок: {lesson?.title || a.lesson_id} | Макс: {a.max_score}</p>
                        </div>
                        <Link href={`/teacher/assignments/${a.id}/submissions`}>
                          <Button variant="outline" size="sm">Сдачи</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Preview as Student */}
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <p className="mt-3 font-medium text-foreground">Просмотр как студент</p>
              <p className="mt-1 text-sm text-muted-foreground">Откройте страницу курса глазами студента</p>
              <Link href={`/courses/${courseId}`}>
                <Button className="mt-4" variant="outline">
                  Открыть страницу курса
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function CourseEditorPage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <CourseEditorContent />
    </RouteGuard>
  )
}
