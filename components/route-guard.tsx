"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { Role } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/403")
    }
  }, [user, loading, allowedRoles, router])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!user) return null
  if (allowedRoles && !allowedRoles.includes(user.role)) return null

  return <>{children}</>
}
