"use client"

import { RouteGuard } from "@/components/route-guard"
import { AppNavbar } from "@/components/app-navbar"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // If we are on the landing page and not logged in, show it without the app-navbar and route-guard
  const isLandingPage = pathname === "/"
  
  if (isLandingPage && !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  return (
    <RouteGuard>
      <div className="flex min-h-screen flex-col">
        <AppNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </RouteGuard>
  )
}
