"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { StudentHome } from "@/components/student-home"
import { LandingPage } from "@/components/landing-page"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === "teacher") router.replace("/teacher")
    if (user?.role === "admin") router.replace("/admin")
  }, [user, router])

  if (loading) return null

  if (!user) {
    return <LandingPage />
  }

  if (user.role !== "student") return null

  return <StudentHome />
}
