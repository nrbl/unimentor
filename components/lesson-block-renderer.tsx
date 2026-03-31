"use client"

import type { LessonBlock } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Info, AlertTriangle, FileText, ExternalLink, Play } from "lucide-react"

function TextBlock({ data }: { data: Record<string, unknown> }) {
  return <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: data.html as string }} />
}

function CalloutBlock({ data }: { data: Record<string, unknown> }) {
  const variant = data.variant as string
  const icons: Record<string, React.ElementType> = { info: Info, warning: AlertTriangle, error: AlertCircle }
  const colors: Record<string, string> = {
    info: "border-primary/30 bg-primary/5",
    warning: "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5",
    error: "border-destructive/30 bg-destructive/5",
  }
  const Icon = icons[variant] || Info
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${colors[variant] || colors.info}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <p className="text-sm text-foreground">{data.text as string}</p>
    </div>
  )
}

function CodeBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-foreground">
      <div className="flex items-center justify-between border-b border-muted-foreground/20 px-4 py-2">
        <span className="text-xs text-muted">{data.language as string}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-background">
        <code>{data.code as string}</code>
      </pre>
    </div>
  )
}

function VideoBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Play className="h-4 w-4" />
        {data.title as string}
      </div>
      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
        <iframe
          src={data.url as string}
          className="h-full w-full"
          allowFullScreen
          title={data.title as string}
        />
      </div>
    </div>
  )
}

function LinkBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <a
      href={data.url as string}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border p-3 text-sm text-primary hover:bg-muted transition-colors"
    >
      <ExternalLink className="h-4 w-4" />
      {data.title as string}
    </a>
  )
}

function FileBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <FileText className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{data.name as string}</p>
        <p className="text-xs text-muted-foreground">{data.size as string}</p>
      </div>
      <a href={data.url as string} className="text-sm text-primary hover:underline">
        Скачать
      </a>
    </div>
  )
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <figure className="space-y-2">
      <img
        src={data.url as string}
        alt={data.alt as string}
        crossOrigin="anonymous"
        className="w-full rounded-lg"
      />
      {data.alt && <figcaption className="text-center text-xs text-muted-foreground">{data.alt as string}</figcaption>}
    </figure>
  )
}

function TableBlock({ data }: { data: Record<string, unknown> }) {
  const headers = data.headers as string[]
  const rows = data.rows as string[][]
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 text-left font-medium text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const blockComponents: Record<string, React.ComponentType<{ data: Record<string, unknown> }>> = {
  text: TextBlock,
  callout: CalloutBlock,
  code: CodeBlock,
  video: VideoBlock,
  link: LinkBlock,
  file: FileBlock,
  image: ImageBlock,
  table: TableBlock,
}

export function LessonBlockRenderer({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block) => {
        const Component = blockComponents[block.type]
        if (!Component) {
          return (
            <Card key={block.id}>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Неизвестный тип блока: {block.type}
              </CardContent>
            </Card>
          )
        }
        // Ensure data is parsed if it's still a string
        let data = block.data
        if (typeof data === "string") {
          try { data = JSON.parse(data) } catch { data = { content: data } }
        }
        return <Component key={block.id} data={data as Record<string, unknown>} />
      })}
    </div>
  )
}
