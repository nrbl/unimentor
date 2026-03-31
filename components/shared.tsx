"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, FolderOpen, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

// ---- Empty State ----
export function EmptyState({ icon: Icon = FolderOpen, title, description }: { icon?: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

// ---- Error State ----
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Произошла ошибка</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Попробовать снова
        </Button>
      )}
    </div>
  )
}

// ---- Loading Skeletons ----
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Skeleton className="mb-3 h-40 w-full rounded-md" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 md:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}

// ---- Progress Bar ----
export function CourseProgressBar({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Progress value={percent} className="h-2 flex-1" />
      <span className="text-xs font-medium text-muted-foreground">{Math.round(percent)}%</span>
    </div>
  )
}

// ---- Status Badge ----
export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    published: { label: "Опубликован", variant: "default" },
    draft: { label: "Черновик", variant: "secondary" },
    completed: { label: "Пройден", variant: "default" },
    in_progress: { label: "В процессе", variant: "outline" },
    not_started: { label: "Не начат", variant: "secondary" },
    pending: { label: "На проверке", variant: "outline" },
    submitted: { label: "Отправлено", variant: "outline" },
    reviewed: { label: "Проверено", variant: "default" },
    ingested: { label: "Обработан", variant: "default" },
    error: { label: "Ошибка", variant: "destructive" },
  }
  const v = variants[status] || { label: status, variant: "secondary" as const }
  return <Badge variant={v.variant}>{v.label}</Badge>
}

// ---- Section Header ----
export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
