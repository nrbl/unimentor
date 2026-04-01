"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { coursesApi, teacherApi } from "@/lib/api"
import type { Course, ModuleWithLessons, Assignment } from "@/lib/types"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ErrorState, PageSkeleton, StatusBadge } from "@/components/shared"
import { 
  Settings, BookOpen, Users, ArrowUpRight, Plus, 
  Pencil, Eye, LayoutDashboard, FileText, CheckCircle2,
  GraduationCap, MessageSquare
} from "lucide-react"
import Link from "next/link"

export default function CourseHubPage() {
  const params = useParams()
  const courseId = Number(params.courseId)
  const { user } = useAuth()
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const detail = await coursesApi.get(courseId)
      setCourse(detail.course)
      setModules(detail.modules || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>
  if (!course) return null

  const allLessons = modules.flatMap(m => m.lessons)
  const totalLessons = allLessons.length
  const publishedLessons = allLessons.filter(l => l.is_published).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <Breadcrumb>
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
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <GraduationCap className="h-7 w-7" />
             </div>
             <div>
                <div className="flex items-center gap-2">
                   <h1 className="text-3xl font-bold tracking-tight text-foreground">{course.title}</h1>
                   <StatusBadge status={course.status} />
                </div>
                <p className="text-muted-foreground max-w-2xl">{course.description}</p>
             </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/courses/${course.id}`}>
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Предпросмотр (Студент)
            </Button>
          </Link>
          <Link href={`/teacher/courses/${course.id}/edit`}>
            <Button className="gap-2 shadow-md">
              <Pencil className="h-4 w-4" />
              Редактировать контент
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-sm transition-hover hover:shadow-md cursor-default border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider flex items-center gap-2">
               <BookOpen className="h-4 w-4" /> Уроки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalLessons}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{publishedLessons} опубликовано</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-indigo-500/20 bg-indigo-500/5 transition-hover hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
               <Users className="h-4 w-4" /> Студенты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">---</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Активных участников</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20 bg-amber-500/5 transition-hover hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
               <MessageSquare className="h-4 w-4" /> Отзывы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">---</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Новых уведомлений</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Module/Lesson Overview */}
        <Card className="shadow-sm h-fit">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between">
               <CardTitle className="text-lg flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                  Структура курса
               </CardTitle>
               <Link href={`/teacher/courses/${course.id}/edit?tab=content`}>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary h-8">
                     <Plus className="h-4 w-4 mr-1" /> Добавить
                  </Button>
               </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {modules.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-10" />
                Модули еще не созданы. Перейдите в редактор для настройки курса.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {modules.map((m) => (
                  <div key={m.module.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                       <h3 className="font-bold text-sm text-foreground uppercase tracking-tight">{m.module.title}</h3>
                       <Badge variant="outline" className="text-[10px]">{m.lessons.length} уроков</Badge>
                    </div>
                    <div className="space-y-1 pl-2 border-l-2 border-primary/10">
                       {m.lessons.slice(0, 3).map(l => (
                          <div key={l.id} className="flex items-center justify-between py-1 text-sm text-muted-foreground group">
                             <span className="truncate group-hover:text-foreground transition-colors">{l.title}</span>
                             {!l.is_published && <Badge variant="secondary" className="text-[9px] h-4">Draft</Badge>}
                          </div>
                       ))}
                       {m.lessons.length > 3 && (
                          <p className="text-[10px] text-muted-foreground italic pt-1">и еще {m.lessons.length - 3} уроков...</p>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rapid Actions */}
        <div className="space-y-6">
           <Card className="border-indigo-500/20 shadow-md shadow-indigo-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                 <FileText className="h-24 w-24 text-indigo-600" />
              </div>
              <CardHeader>
                 <CardTitle className="text-lg font-bold">Проверка заданий</CardTitle>
                 <CardDescription>Оценивайте работы студентов и давайте обратную связь.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Сдачи студентов</p>
                        <p className="text-xs text-muted-foreground">Всего ожидают проверки: --</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-indigo-500/30 hover:bg-indigo-500/10" disabled>
                       Открыть список
                    </Button>
                 </div>
                 <p className="text-[11px] text-muted-foreground italic">
                    💡 Совет: Используйте AI для быстрой генерации начального фидбека по работам.
                 </p>
              </CardContent>
           </Card>

           <Card className="border-amber-500/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Settings className="h-24 w-24 text-amber-600" />
              </div>
              <CardHeader>
                 <CardTitle className="text-lg font-bold">Настройки и AI</CardTitle>
                 <CardDescription>Управление языком, обложкой и параметрами ИИ-тьютора.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex flex-col gap-2">
                     <Link href={`/teacher/courses/${course.id}/edit`}>
                        <Button variant="ghost" className="w-full justify-between h-10 px-4 hover:bg-amber-500/10 hover:text-amber-700">
                           Изменить описание и язык
                           <ArrowUpRight className="h-4 w-4 opacity-50" />
                        </Button>
                     </Link>
                     <Button variant="ghost" className="w-full justify-between h-10 px-4 group" disabled>
                        Загрузить материалы для ИИ
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Coming soon</Badge>
                     </Button>
                  </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
