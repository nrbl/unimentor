"use client"

import { useState, useEffect } from "react"
import { Bot, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ProactiveNudgeProps {
  courseName?: string
  courseId?: number
}

export function ProactiveNudge({ courseName, courseId }: ProactiveNudgeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasDismissed, setHasDismissed] = useState(false)

  useEffect(() => {
    // Show the nudge after 3 seconds for demonstration
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [hasDismissed])

  if (!isVisible || !courseName || !courseId) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-sm">
      <div className="relative overflow-hidden rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur-md">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>
        
        <button 
          onClick={() => {
            setIsVisible(false)
            setHasDismissed(true)
          }}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-4 relative z-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold">
              UniMentor AI
              <Sparkles className="h-3 w-3 text-amber-500" />
            </h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Вижу, ты начал курс <span className="font-medium text-foreground">«{courseName}»</span>, но так и не закончил последние темы. Хочешь я объясню их быстро "на пальцах"?
            </p>
            <div className="mt-3 flex gap-2">
              <Link href={`/courses/${courseId}`}>
                <Button size="sm" className="h-8 text-xs px-3">
                  Давай!
                </Button>
              </Link>
              <Button onClick={() => {setIsVisible(false); setHasDismissed(true)}} size="sm" variant="ghost" className="h-8 text-xs px-3">
                Позже
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
