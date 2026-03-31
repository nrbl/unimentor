"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut, Mail, User, Shield } from "lucide-react"

const roleLabels: Record<string, string> = {
  student: "Студент",
  teacher: "Преподаватель",
  admin: "Администратор",
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Профиль</h1>

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{user.full_name}</h2>
            <Badge variant="secondary" className="mt-1">
              {roleLabels[user.role] || user.role}
            </Badge>
          </div>

          <div className="mt-2 w-full space-y-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Полное имя</p>
                <p className="text-sm font-medium text-foreground">{user.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Роль</p>
                <p className="text-sm font-medium text-foreground">{roleLabels[user.role] || user.role}</p>
              </div>
            </div>
          </div>

          <Button variant="destructive" className="mt-4 w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
