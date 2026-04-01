"use client"

import { useAuth } from "@/lib/auth-context"
import { RouteGuard } from "@/components/route-guard"
import { SectionHeader } from "@/components/shared"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockSkills } from "@/lib/mock-data"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { BrainCircuit, Target, Trophy, TrendingUp, AlertCircle, Award, Sparkles, LayoutDashboard, Database, GraduationCap } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AchievementCertificate } from "@/components/achievement-certificate"
import { teacherApi, coursesApi } from "@/lib/api"
import type { Course } from "@/lib/types"

function ProfileContent() {
  const { user } = useAuth()
  const [isCertOpen, setIsCertOpen] = useState(false)
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([])
  const [studentCourses, setStudentCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!user) return
    setLoading(true)
    const loadData = async () => {
      try {
        if (user.role === "teacher") {
          const courses = await teacherApi.myCourses()
          setTeacherCourses(courses)
        } else if (user.role === "student") {
          const courses = await coursesApi.listMy()
          setStudentCourses(courses)
        }
      } catch (e) {
        console.error("Profile load error:", e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  if (!user) return null

  // Clean slate: no mock data for real users. 
  // Radar chart skills will be empty until real skill API is implemented.
  const userSkills: any[] = [] // mockSkills[user.id] || [] (REMOVED)

  // Sort to find strengths/weaknesses
  const sortedSkills = [...userSkills].sort((a, b) => b.proficiency - a.proficiency)
  const strongest = sortedSkills[0]
  const weakest = sortedSkills[sortedSkills.length - 1]

  const averageProficiency = userSkills.length > 0 
    ? Math.round(userSkills.reduce((acc, s) => acc + s.proficiency, 0) / userSkills.length)
    : 0
  const isEligibleForCert = averageProficiency >= 70

  const activeCoursesCount = teacherCourses.filter(c => c.status === "published").length
  const draftCoursesCount = teacherCourses.filter(c => c.status === "draft").length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Профиль: {user.full_name}</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Badge role={user.role} />
          {user.email}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {user.role === "student" ? (
          <Card className="flex flex-col border-primary/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BrainCircuit className="text-primary w-6 h-6" />
                Матрица Навыков (Skill Profile)
              </CardTitle>
              <CardDescription>Оценка ваших профессиональных компетенций ИИ-ассистентом.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center min-h-[350px]">
              {userSkills.length > 0 ? (
                 <ResponsiveContainer width="100%" height={350}>
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={userSkills}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="concept" tick={{ fill: "hsl(var(--foreground))", fontSize: 13, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Radar
                        name="Владение (%)"
                        dataKey="proficiency"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.4}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background))" }} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-xl w-full h-full">
                    <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-base font-medium text-foreground">Ваша матрица навыков пока пуста</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      Начните проходить курсы и решать квизы, чтобы ИИ смог оценить ваши компетенции.
                    </p>
                  </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col border-indigo-500/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <LayoutDashboard className="text-indigo-600 w-6 h-6" />
                Статистика Преподавания
              </CardTitle>
              <CardDescription>Обзор вашей активности как создателя курсов.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/30 border border-muted flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Опубликовано</span>
                  <span className="text-3xl font-black text-indigo-600">{activeCoursesCount}</span>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-muted flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">В черновиках</span>
                  <span className="text-3xl font-black text-amber-600">{draftCoursesCount}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 flex items-center gap-4">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-indigo-900 dark:text-indigo-400">Источник Знаний</p>
                  <p className="text-sm text-indigo-700/70 dark:text-indigo-400/70">Вы являетесь экспертом UniMentor.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6 flex flex-col">
          {user.role === "student" && userSkills.length > 0 && (
            <>
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="text-amber-500 w-5 h-5" />
                    Ваша сильная сторона
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{strongest?.concept}</p>
                      <p className="text-sm text-muted-foreground">Отличный результат, так держать!</p>
                    </div>
                    <div className="text-2xl font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">
                      {strongest?.proficiency}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/30 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Target className="h-24 w-24 text-destructive" />
                 </div>
                <CardHeader className="pb-3 border-b border-destructive/10 relative z-10">
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    Зона роста
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-semibold text-lg">{weakest?.concept}</p>
                      <p className="text-sm text-muted-foreground">Требуется больше практики.</p>
                    </div>
                    <div className="text-2xl font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-lg">
                      {weakest?.proficiency}%
                    </div>
                  </div>
                  <div className="bg-destructive/5 rounded-md p-3 text-sm flex gap-2 border border-destructive/10">
                    <TrendingUp className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p>
                      <span className="font-medium">Совет от ИИ:</span> Попробуйте пройти дополнительные квизы по этой теме в режиме "Подготовка", чтобы повысить уровень навыка.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card className={(user.role === "student" && userSkills.length === 0) ? "" : "flex-1"}>
            <CardHeader className="pb-3 text-center lg:text-left">
              <CardTitle className="text-lg flex items-center gap-2">
                 <GraduationCap className="h-5 w-5 text-muted-foreground" />
                 Детали аккаунта
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Дата регистрации</span>
                    <p className="font-medium mt-1">{new Date(user.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">ID в системе</span>
                    <p className="font-medium mt-1">#000{user.id}</p>
                  </div>
                </div>
                {user.role === "student" && studentCourses.length > 0 && (
                   <div className="pt-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Активных курсов</span>
                      <p className="font-medium mt-1 text-primary">{studentCourses.length}</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>

          {user.role === "student" && isEligibleForCert && (
            <div className="mt-auto">
               <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/20 border-amber-500/30 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                     <Award className="h-20 w-20 text-amber-600" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                       <div className="flex items-center gap-2 text-amber-700">
                          <Sparkles className="h-5 w-5" />
                          <span className="text-sm font-bold uppercase tracking-wider">Доступно достижение</span>
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-foreground">Именной Сертификат</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ваш уровень знаний ({averageProficiency}%) позволяет получить официальное подтверждение квалификации.
                          </p>
                       </div>
                       <Dialog open={isCertOpen} onOpenChange={setIsCertOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20">
                              Посмотреть сертификат
                              <Award className="ml-2 h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl p-0 border-none bg-transparent shadow-none">
                            <AchievementCertificate 
                              user={user} 
                              skills={userSkills} 
                              onClose={() => setIsCertOpen(false)} 
                            />
                          </DialogContent>
                       </Dialog>
                    </div>
                  </CardContent>
               </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Badge({ role }: { role: string }) {
  if (role === "admin") return <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-semibold">Админ</span>
  if (role === "teacher") return <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-xs font-semibold">Преподаватель</span>
  return <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">Студент</span>
}

export default function ProfilePage() {
  return (
    <RouteGuard>
      <ProfileContent />
    </RouteGuard>
  )
}
