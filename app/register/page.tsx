"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
  const { register, user } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      router.replace(user.role === "teacher" ? "/teacher" : user.role === "admin" ? "/admin" : "/profile")
    }
  }, [user, router])

  if (user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      toast.error(t("errors.fillAll", "Please fill all fields"))
      return
    }
    if (password.length < 6) {
      toast.error(t("register.passwordMin", "Password must be at least 6 characters"))
      return
    }
    setLoading(true)
    try {
      await register(fullName, email, password, role)
  toast.success(t("register.success", "Registration complete"))
      if (role === "teacher") {
        router.push("/teacher")
      } else {
          router.push("/profile")
      }
    } catch (err) {
        toast.error(err instanceof Error ? err.message : t("register.error", "Registration failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
          <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t("register.title", "Register")}</CardTitle>
          <CardDescription>{t("register.description", "Create a UniMentor account")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">{t("register.fullName", "Full name")}</Label>
              <Input
                id="fullName"
                placeholder="Иванов Иван"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t("register.password", "Password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">{t("register.role", "Role")}</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "teacher")}
                className="rounded-md border px-2 py-2"
              >
                <option value="student">{t("register.role_student", "Student")}</option>
                <option value="teacher">{t("register.role_teacher", "Teacher")}</option>
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("register.submit", "Register")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("register.haveAccount", "Already have an account?") + " "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t("login.submit", "Sign in")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
