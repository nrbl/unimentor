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

export default function LoginPage() {
  const { login, user } = useAuth()
  const { t } = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    if (!email || !password) {
      toast.error(t("errors.fillAll", "Please fill all fields"))
      return
    }
    setLoading(true)
    try {
      const session = await login(email, password)
  toast.success(t("login.success", "Signed in"))
      // Explicitly redirect based on role
      const storedRole = localStorage.getItem("unimentor_role")
      if (storedRole === "teacher") {
        router.push("/teacher")
      } else if (storedRole === "admin") {
        router.push("/admin")
      } else {
        router.push("/profile")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("login.error", "Sign in failed"))
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
          <CardTitle className="text-2xl">{t("login.title", "Sign in to UniMentor")}</CardTitle>
          <CardDescription>{t("login.description", "Enter your email and password to sign in")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <Label htmlFor="password">{t("login.password", "Password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("login.submit", "Sign in")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("login.noAccount", "No account?") + " "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {t("login.register", "Register")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
