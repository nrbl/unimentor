"use client"

import { useEffect, useState } from "react"
import { coursesApi } from "@/lib/api"
import type { Course } from "@/lib/types"
import { CourseCard } from "@/components/course-card"
import { EmptyState, ErrorState, CardSkeleton, SectionHeader } from "@/components/shared"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen } from "lucide-react"
import { toast } from "sonner"

export default function CatalogPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [language, setLanguage] = useState<string>("all")
  const [sort, setSort] = useState<string>("default")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      let data = await coursesApi.listPublished()
      // Client-side filtering since backend doesn't support query params
      if (search) {
        const q = search.toLowerCase()
        data = data.filter(
          (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        )
      }
      if (language !== "all") {
        data = data.filter((c) => c.language === language)
      }
      if (sort === "title") {
        data = [...data].sort((a, b) => a.title.localeCompare(b.title))
      }
      setCourses(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
      toast.error("Ошибка загрузки каталога")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, language, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SectionHeader title="Каталог курсов" description="Выберите курс и начните обучение" />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск курсов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Язык" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все языки</SelectItem>
            <SelectItem value="ru">Русский</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">По умолчанию</SelectItem>
            <SelectItem value="title">По названию</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="Курсы не найдены" description="Попробуйте изменить параметры поиска" />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}
