"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { User, Role } from "./types"
import { auth as authApi } from "./api"

interface AuthState {
  user: User | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (full_name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  isRole: (role: Role) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  // Restore session on mount
  useEffect(() => {
    const tokens = authApi.getTokens()
    if (tokens?.accessToken) {
      authApi.me()
        .then((user) => {
          // backend role is now normalized in api.me()
          if (user.role) {
            localStorage.setItem("unimentor_role", user.role)
          }
          setState({ user, loading: false })
        })
        .catch(() => {
          authApi.clearTokens()
          // localStorage.removeItem("unimentor_role") // keep it for better UX if they reload
          setState({ user: null, loading: false })
        })
    } else {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    // Always trust the role returned from backend (it's normalized in api.ts)
    if (res.user.role) {
      localStorage.setItem("unimentor_role", res.user.role)
    }
    setState({ user: res.user, loading: false })
  }, [])

  const register = useCallback(async (full_name: string, email: string, password: string, role?: string) => {
    // Register creates the user, then we log in to get tokens
    await authApi.register(full_name, email, password, role)
    // Now login with the same credentials
    const res = await authApi.login(email, password)
    // If we specifically registered as teacher, make sure it reflects
    if (role === "teacher") {
      res.user.role = "teacher"
    }
    localStorage.setItem("unimentor_role", res.user.role || "student")
    setState({ user: res.user, loading: false })
  }, [])

  const logout = useCallback(() => {
    authApi.clearTokens()
    localStorage.removeItem("unimentor_role")
    setState({ user: null, loading: false })
  }, [])

  const isRole = useCallback((role: Role) => state.user?.role === role, [state.user])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
