"use client"

import { AuthProvider } from "@/lib/auth-context"
import { LocaleProvider } from "@/lib/locale-context"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </AuthProvider>
  )
}
