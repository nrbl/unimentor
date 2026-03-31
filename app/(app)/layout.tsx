"use client"

import { RouteGuard } from "@/components/route-guard"
import { AppNavbar } from "@/components/app-navbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="flex min-h-screen flex-col">
        <AppNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </RouteGuard>
  )
}
