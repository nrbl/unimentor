"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { coursesApi } from "@/lib/api"
import type { Course } from "@/lib/types"
import { CourseCard } from "@/components/course-card"
import { EmptyState, ErrorState, CardSkeleton, SectionHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BookOpen, Play } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function StudentHome() {
  const { user } = useAuth()
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [recommended, setRecommended] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [my, all] = await Promise.all([
        coursesApi.listMy(),
        coursesApi.listPublished(),
      ])
      setMyCourses(my)
      const myIds = my.map((c) => c.id)
      setRecommended(all.filter((c) => !myIds.includes(c.id)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
      toast.error("Ошибка загрузки данных")
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
      <h1 className="text-2xl font-bold text-foreground">
        {"Привет, "}{user?.full_name?.split(" ")[0] || "Студент"}{"!"}
      </h1>
      <p className="mt-1 text-muted-foreground">Продолжайте обучение и достигайте новых высот.</p>

      {/* Continue Learning */}
      {myCourses.length > 0 && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Продолжить обучение</p>
                <p className="font-semibold text-foreground">{myCourses[0].title}</p>
              </div>
            </div>
            <Link href={`/courses/${myCourses[0].id}`}>
              <Button>
                Продолжить
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* My Courses */}
      <div className="mt-8">
        <SectionHeader
          title="Мои курсы"
          action={
            myCourses.length > 0 ? (
              <Link href="/catalog">
                <Button variant="outline" size="sm">Все курсы</Button>
              </Link>
            ) : undefined
          }
        />
        {loading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : myCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="У вас пока нет курсов"
            description="Перейдите в каталог, чтобы записаться на курс"
          />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Рекомендованные курсы" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              recommended.map((c) => <CourseCard key={c.id} course={c} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}
