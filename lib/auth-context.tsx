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
          setState({ user, loading: false })
        })
        .catch(() => {
          authApi.clearTokens()
          setState({ user: null, loading: false })
        })
    } else {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setState({ user: res.user, loading: false })
  }, [])

  const register = useCallback(async (full_name: string, email: string, password: string, role?: string) => {
    // Register creates the user, then we log in to get tokens
    await authApi.register(full_name, email, password, role)
    // Now login with the same credentials
    const res = await authApi.login(email, password)
    setState({ user: res.user, loading: false })
  }, [])

  const logout = useCallback(() => {
    authApi.clearTokens()
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
