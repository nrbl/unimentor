"use client"

import { useEffect, useState } from "react"
import { RouteGuard } from "@/components/route-guard"
import { SectionHeader } from "@/components/shared"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, AlertTriangle, Lightbulb, ArrowUpRight, Clock, Plus, Zap, Star, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { teacherApi } from "@/lib/api"
import type { Course } from "@/lib/types"

function TeacherDashboardContent() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const myCourses = await teacherApi.myCourses()
      setCourses(myCourses)
    } catch (e: any) {
      console.error("Dashboard Load Error:", e)
      const msg = e instanceof Error ? e.message : (typeof e === "string" ? e : JSON.stringify(e))
      setError(msg || "Ошибка загрузки данных")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (error) return <div className="p-6"><SectionHeader title="Панель Управления" description="Ошибка" /><div className="mt-8 rounded-lg bg-destructive/10 p-12 text-center text-destructive border border-destructive/20 shadow-sm"><AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" /><h3 className="text-lg font-bold mb-2">Не удалось загрузить данные</h3><p className="text-sm opacity-80 mb-6 max-w-md mx-auto">{error}</p><Button onClick={loadData} variant="outline" className="border-destructive/30 hover:bg-destructive/10">Повторить попытку</Button></div></div>

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground text-sm">Синхронизация данных курсов...</p>
        </div>
      </div>
    )
  }

  const activeCourses = courses.filter(c => c.status === "published").length
  const draftCourses = courses.filter(c => c.status === "draft").length
  const totalCourses = courses.length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="Панель Управления"
        description="Создавайте курсы, проверяйте задания и анализируйте успеваемость"
        action={
          <Link href="/teacher/courses/new">
            <Button className="shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Создать курс
            </Button>
          </Link>
        }
      />
      
      {totalCourses === 0 ? (
        <div className="relative rounded-2xl border bg-muted/20 p-8 sm:p-12 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <SparklesIcon className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Добро пожаловать в UniMentor</h2>
            <p className="text-muted-foreground text-lg">
              Платформа открыта для ваших идей. Создайте свой первый курс, добавьте уроки и позвольте ИИ стать вашим ассистентом в проверке знаний студентов.
            </p>
            <div className="pt-4 flex gap-4">
              <Link href="/teacher/courses/new">
                <Button size="lg" className="h-12 px-8 text-base">
                  <Star className="mr-2 h-5 w-5" />
                  Мой первый курс
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-primary/20 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 bg-primary/5 p-8 rounded-full transition-transform group-hover:scale-110">
                <BookOpen className="h-8 w-8 text-primary/40" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium">Всего курсов</CardTitle>
                <DatabaseIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-black text-primary">{totalCourses}</div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Курсов в системе</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Опубликовано</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeCourses}</div>
                <p className="text-xs text-muted-foreground mt-1">Доступно студентам</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Черновики</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{draftCourses}</div>
                <p className="text-xs text-muted-foreground mt-1">В процессе подготовки</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Real Data: Quick Course List */}
            <Card className="shadow-sm border-muted">
              <CardHeader>
                <CardTitle>Недавние курсы</CardTitle>
                <CardDescription>Управление вашими материалами</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {courses.slice(0, 5).map(c => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                          {c.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-none">{c.title}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${c.status === "published" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                              {c.status === "published" ? "Активен" : "Черновик"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/teacher/courses/${c.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-4 text-xs hover:bg-primary hover:text-white transition-colors">
                          Дашборд
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {courses.length > 5 && (
                    <div className="p-3 text-center border-t">
                      <Link href="/teacher/courses" className="text-sm text-primary hover:underline">
                        Посмотреть все курсы
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Ready State */}
            <Card className="border-indigo-500/30 shadow-sm shadow-indigo-500/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="h-40 w-40 text-indigo-500" />
              </div>
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                    <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg">ИИ-ассистент готов к работе</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-6">
                  UniMentor AI автоматически анализирует тексты уроков и создает интерактивного тьютора для каждого курса.
                </p>
                <div className="space-y-4">
                  <div className="bg-background/80 dark:bg-card/50 p-4 rounded-xl border border-indigo-500/10 text-sm backdrop-blur-sm shadow-sm flex gap-3">
                    <Zap className="h-5 w-5 text-indigo-500 shrink-0" />
                    <div>
                      <span className="font-bold text-foreground block mb-1">Генерация квизов и подсказок</span>
                      <span className="text-muted-foreground">Добавляйте материалы в формате PDF или текста через панель "Материалы и AI" в настройках курса.</span>
                    </div>
                  </div>
                  <div className="bg-background/80 dark:bg-card/50 p-4 rounded-xl border border-indigo-500/10 text-sm backdrop-blur-sm shadow-sm flex gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-500 shrink-0" />
                    <div>
                      <span className="font-bold text-foreground block mb-1">Помощь с проверкой</span>
                      <span className="text-muted-foreground">Система подсвечивает частые ошибки из сдач студентов и помогает формировать обратную связь.</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </>
      )}
    </div>
  )
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}

function DatabaseIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}

export default function TeacherDashboardPage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <TeacherDashboardContent />
    </RouteGuard>
  )
}
