"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import ru from "@/locales/ru.json"
import en from "@/locales/en.json"

type Locale = "ru" | "en"

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, fallback?: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("unimentor_locale")
      if (saved === "en" || saved === "ru") return saved
      const nav = navigator.language || "en"
      return nav.startsWith("ru") ? "ru" : "en"
    }
    return "ru"
  })

  useEffect(() => {
    try {
      localStorage.setItem("unimentor_locale", locale)
    } catch {}
  }, [locale])

  const dictionaries: Record<Locale, Record<string, string>> = useMemo(() => ({ ru, en }), [])

  const t = (key: string, fallback = "") => {
    const dict = dictionaries[locale] || {}
    return dict[key] ?? fallback ?? key
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}

export default LocaleProvider
