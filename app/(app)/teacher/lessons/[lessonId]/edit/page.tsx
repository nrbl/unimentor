"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { lessonsApi, teacherApi } from "@/lib/api"
import type { Lesson, LessonBlock, LessonBlockType } from "@/lib/types"
import { RouteGuard } from "@/components/route-guard"
import { LessonBlockRenderer } from "@/components/lesson-block-renderer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ErrorState, PageSkeleton, EmptyState } from "@/components/shared"
import { ArrowLeft, Plus, Save, Loader2, GripVertical, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const blockTypeLabels: Record<LessonBlockType, string> = {
  text: "Текст (HTML)",
  callout: "Выноска",
  code: "Код",
  video: "Видео",
  link: "Ссылка",
  file: "Файл",
  image: "Изображение",
  table: "Таблица",
}

interface EditableBlock {
  id: string
  type: LessonBlockType
  data: Record<string, unknown>
  sort: number
}

function LessonEditorContent() {
  const params = useParams()
  const lessonId = Number(params.lessonId)

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [blocks, setBlocks] = useState<EditableBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // New block state
  const [newBlockType, setNewBlockType] = useState<LessonBlockType>("text")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await lessonsApi.get(lessonId)
      setLesson(data.lesson)
      // Parse blocks - data may be JSON string
      const parsedBlocks = (data.blocks || []).map((b: LessonBlock) => {
        let parsedData = b.data
        if (typeof parsedData === "string") {
          try { parsedData = JSON.parse(parsedData) } catch { parsedData = {} }
        }
        return { id: String(b.id), type: b.type, data: parsedData as Record<string, unknown>, sort: b.sort }
      })
      setBlocks(parsedBlocks)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Send only the fields the server expects. Server disallows unknown fields (DisallowUnknownFields),
      // so omit `id` and `lesson_id` which are managed server-side.
      const blocksToSend = blocks.map((b, i) => ({
        type: b.type,
        data: b.data,
        sort: i + 1,
      }))
      await teacherApi.upsertLessonBlocks(lessonId, blocksToSend)
      toast.success("Блоки урока сохранены")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const addBlock = () => {
    const defaults: Record<LessonBlockType, Record<string, unknown>> = {
      text: { html: "<p>Новый текстовый блок</p>" },
      callout: { variant: "info", text: "Заметка" },
      code: { language: "python", code: "# Ваш код" },
      video: { url: "https://www.youtube.com/embed/...", title: "Видео" },
      link: { url: "https://example.com", title: "Ссылка" },
      file: { url: "/files/file.pdf", name: "Файл.pdf", size: "0 KB" },
      image: { url: "https://placehold.co/800x400", alt: "Изображение" },
      table: { headers: ["Колонка 1", "Колонка 2"], rows: [["Значение 1", "Значение 2"]] },
    }

    const newBlock: EditableBlock = {
      id: `b-${Date.now()}`,
      type: newBlockType,
      data: defaults[newBlockType],
      sort: blocks.length + 1,
    }
    setBlocks((prev) => [...prev, newBlock])
  }

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
  }

  const updateBlockData = (blockId: string, key: string, value: unknown) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, [key]: value } } : b))
    )
  }

  const moveBlock = (idx: number, direction: "up" | "down") => {
    const newBlocks = [...blocks]
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= newBlocks.length) return
    ;[newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]]
    setBlocks(newBlocks)
  }

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>
  if (!lesson) return null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/teacher">Мои курсы</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="mr-1 h-4 w-4" />
            {showPreview ? "Редактор" : "Предпросмотр"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Сохранить
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div className="mt-6">
          {blocks.length === 0 ? (
            <EmptyState title="Нет блоков" description="Добавьте блоки контента" />
          ) : (
            <LessonBlockRenderer blocks={blocks.map((b, i) => ({ id: Number(b.id), lesson_id: lessonId, type: b.type, data: b.data, sort: i + 1 }))} />
          )}
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {/* Add Block */}
          <Card>
            <CardContent className="flex items-end gap-3 pt-6">
              <div className="flex flex-1 flex-col gap-2">
                <Label>Тип блока</Label>
                <Select value={newBlockType} onValueChange={(v) => setNewBlockType(v as LessonBlockType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(blockTypeLabels) as [LessonBlockType, string][]).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addBlock}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить блок
              </Button>
            </CardContent>
          </Card>

          {/* Block List */}
          {blocks.length === 0 ? (
            <EmptyState title="Нет блоков" description="Добавьте блоки контента к уроку" />
          ) : (
            blocks.map((block, idx) => (
              <Card key={block.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Badge variant="secondary">{blockTypeLabels[block.type]}</Badge>
                    <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveBlock(idx, "up")} disabled={idx === 0}>
                      <span className="text-xs">&#9650;</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveBlock(idx, "down")} disabled={idx === blocks.length - 1}>
                      <span className="text-xs">&#9660;</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBlock(block.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BlockEditor block={block} onChange={(key, val) => updateBlockData(block.id, key, val)} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function BlockEditor({ block, onChange }: { block: EditableBlock; onChange: (key: string, val: unknown) => void }) {
  switch (block.type) {
    case "text":
      return (
        <div className="flex flex-col gap-2">
          <Label>HTML-контент</Label>
          <Textarea value={block.data.html as string || ""} onChange={(e) => onChange("html", e.target.value)} rows={4} className="font-mono text-xs" />
        </div>
      )
    case "callout":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>Тип</Label>
            <Select value={block.data.variant as string || "info"} onValueChange={(v) => onChange("variant", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Информация</SelectItem>
                <SelectItem value="warning">Предупреждение</SelectItem>
                <SelectItem value="error">Ошибка</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Текст</Label>
            <Textarea value={block.data.text as string || ""} onChange={(e) => onChange("text", e.target.value)} rows={2} />
          </div>
        </div>
      )
    case "code":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>Язык</Label>
            <Input value={block.data.language as string || ""} onChange={(e) => onChange("language", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Код</Label>
            <Textarea value={block.data.code as string || ""} onChange={(e) => onChange("code", e.target.value)} rows={6} className="font-mono text-xs" />
          </div>
        </div>
      )
    case "video":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>URL (embed)</Label>
            <Input value={block.data.url as string || ""} onChange={(e) => onChange("url", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Заголовок</Label>
            <Input value={block.data.title as string || ""} onChange={(e) => onChange("title", e.target.value)} />
          </div>
        </div>
      )
    case "link":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>URL</Label>
            <Input value={block.data.url as string || ""} onChange={(e) => onChange("url", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Заголовок</Label>
            <Input value={block.data.title as string || ""} onChange={(e) => onChange("title", e.target.value)} />
          </div>
        </div>
      )
    case "file":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>URL файла</Label>
            <Input value={block.data.url as string || ""} onChange={(e) => onChange("url", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Имя файла</Label>
            <Input value={block.data.name as string || ""} onChange={(e) => onChange("name", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Размер</Label>
            <Input value={block.data.size as string || ""} onChange={(e) => onChange("size", e.target.value)} />
          </div>
        </div>
      )
    case "image":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>URL изображения</Label>
            <Input value={block.data.url as string || ""} onChange={(e) => onChange("url", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Alt-текст</Label>
            <Input value={block.data.alt as string || ""} onChange={(e) => onChange("alt", e.target.value)} />
          </div>
        </div>
      )
    case "table":
      return (
        <div className="flex flex-col gap-2">
          <Label>Данные таблицы (JSON)</Label>
          <Textarea
            value={JSON.stringify({ headers: block.data.headers, rows: block.data.rows }, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                if (parsed.headers) onChange("headers", parsed.headers)
                if (parsed.rows) onChange("rows", parsed.rows)
              } catch {
                // ignore invalid JSON while typing
              }
            }}
            rows={6}
            className="font-mono text-xs"
          />
        </div>
      )
    default:
      return <p className="text-sm text-muted-foreground">Неизвестный тип блока</p>
  }
}

export default function LessonEditorPage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <LessonEditorContent />
    </RouteGuard>
  )
}
