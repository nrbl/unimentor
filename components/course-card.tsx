"use client"

import Link from "next/link"
import type { Course } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge, CourseProgressBar } from "@/components/shared"
import { BookOpen } from "lucide-react"
import type { ReactNode } from "react"

interface CourseCardProps {
  course: Course
  progress?: number
  showStatus?: boolean
  /** If true (default) the whole card links to the public course page */
  linkToCourse?: boolean
  /** Optional actions area rendered inside the card content (right side) */
  actions?: ReactNode
}

export function CourseCard({ course, progress, showStatus, linkToCourse = true, actions }: CourseCardProps) {
  const Inner = (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-40 bg-muted">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <BookOpen className="h-12 w-12 text-primary/40" />
        </div>
        {showStatus && (
          <div className="absolute right-2 top-2">
            <StatusBadge status={course.status} />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{course.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
            {progress !== undefined && (
              <CourseProgressBar percent={progress} className="mt-3" />
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{course.language.toUpperCase()}</span>
            </div>
          </div>
          {actions && <div className="ml-4 flex items-start">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )

  if (linkToCourse) {
    return <Link href={`/courses/${course.id}`}>{Inner}</Link>
  }
  return Inner
}
