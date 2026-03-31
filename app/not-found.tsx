import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Страница не найдена</p>
      <p className="mt-1 text-sm text-muted-foreground">Запрашиваемая страница не существует или была удалена.</p>
      <Link href="/" className="mt-6">
        <Button>На главную</Button>
      </Link>
    </div>
  )
}
