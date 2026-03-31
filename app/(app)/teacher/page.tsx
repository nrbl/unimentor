"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { teacherApi } from "@/lib/api"
import type { Course } from "@/lib/types"
import { RouteGuard } from "@/components/route-guard"
import { CourseCard } from "@/components/course-card"
import { EmptyState, ErrorState, CardSkeleton, SectionHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function TeacherDashboardContent() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await teacherApi.myCourses()
      setCourses(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
      toast.error("Ошибка загрузки курсов")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SectionHeader
        title="Мои курсы"
        description="Управляйте своими курсами и материалами"
        action={
          <Link href="/teacher/courses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Создать курс
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="У вас пока нет курсов" description="Создайте свой первый курс" />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id}>
              <CourseCard
                course={c}
                showStatus
                linkToCourse={false}
                actions={(
                  <div className="flex flex-col gap-2">
                    <Link href={`/courses/${c.id}`}>
                      <Button size="sm" variant="outline">Посмотреть</Button>
                    </Link>
                    <Link href={`/teacher/courses/${c.id}/edit`}>
                      <Button size="sm">Редактировать</Button>
                    </Link>
                  </div>
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TeacherDashboardPage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <TeacherDashboardContent />
    </RouteGuard>
  )
}
