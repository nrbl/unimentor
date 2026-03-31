"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { teacherApi } from "@/lib/api"
import { RouteGuard } from "@/components/route-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function NewCourseContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [language, setLanguage] = useState("ru")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim()) {
      toast.error("Введите название курса")
      return
    }
    setLoading(true)
    try {
      const course = await teacherApi.createCourse({
        title,
        description,
        language,
      })
      toast.success("Курс создан!")
      router.push(`/teacher/courses/${course.id}/edit`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка создания курса")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/teacher" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Назад к курсам
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Создать новый курс</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" placeholder="Основы Python" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" placeholder="Описание курса..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Язык курса</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать курс
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewCoursePage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <NewCourseContent />
    </RouteGuard>
  )
}
