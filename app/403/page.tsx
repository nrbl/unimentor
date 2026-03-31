import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldX } from "lucide-react"

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">403</h1>
      <p className="mt-2 text-lg text-muted-foreground">Доступ запрещён</p>
      <p className="mt-1 text-sm text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
      <Link href="/" className="mt-6">
        <Button>На главную</Button>
      </Link>
    </div>
  )
}
