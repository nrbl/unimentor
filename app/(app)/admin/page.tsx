"use client"

import { useEffect, useState } from "react"
import { adminApi } from "@/lib/api"
import type { User, Course } from "@/lib/types"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorState, PageSkeleton, StatusBadge, EmptyState, SectionHeader } from "@/components/shared"
import { Users, BookOpen, Loader2, Shield, GraduationCap, User as UserIcon } from "lucide-react"
import { toast } from "sonner"

const roleLabels: Record<string, { label: string; icon: React.ElementType }> = {
  student: { label: "Студент", icon: UserIcon },
  teacher: { label: "Преподаватель", icon: GraduationCap },
  admin: { label: "Админ", icon: Shield },
}

function AdminPanelContent() {
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingCourse, setTogglingCourse] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [u, c] = await Promise.all([adminApi.listUsers(), adminApi.listCourses()])
      setUsers(u)
      setCourses(c)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const toggleCourseStatus = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published"
    setTogglingCourse(courseId)
    try {
      const updated = await adminApi.setCourseStatus(courseId, newStatus as "published" | "draft")
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)))
      toast.success(`Статус изменён на: ${newStatus === "published" ? "Опубликован" : "Черновик"}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setTogglingCourse(null)
    }
  }

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SectionHeader title="Админ-панель" description="Управление пользователями и курсами" />

      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" />
            Пользователи ({users.length})
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            Курсы ({courses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          {users.length === 0 ? (
            <EmptyState icon={Users} title="Нет пользователей" />
          ) : (
            <div className="flex flex-col gap-2">
              {users.map((u) => {
                const roleInfo = roleLabels[u.role] || { label: u.role, icon: UserIcon }
                return (
                  <Card key={u.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <roleInfo.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{u.full_name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <Badge variant={u.role === "admin" ? "destructive" : u.role === "teacher" ? "default" : "secondary"}>
                        {roleInfo.label}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          {courses.length === 0 ? (
            <EmptyState icon={BookOpen} title="Нет курсов" />
          ) : (
            <div className="flex flex-col gap-2">
              {courses.map((c) => (
                <Card key={c.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.language.toUpperCase()} | ID: {c.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={c.status} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCourseStatus(c.id, c.status)}
                        disabled={togglingCourse === c.id}
                      >
                        {togglingCourse === c.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        {c.status === "published" ? "В черновик" : "Опубликовать"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AdminPage() {
  return (
    <RouteGuard allowedRoles={["admin"]}>
      <AdminPanelContent />
    </RouteGuard>
  )
}
