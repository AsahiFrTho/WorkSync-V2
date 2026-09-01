'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import type { Role } from '@/lib/auth/roles'

export interface SessionInfo {
  email: string
  role: Role
  name: string
  issuedAt?: number
}

interface SessionContextType {
  session: SessionInfo | null
  role: Role
  loading: boolean
  refreshSession: () => Promise<void>
  setSessionUser: (user: SessionInfo | null) => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  role: 'admin',
  loading: true,
  refreshSession: async () => {},
  setSessionUser: () => {},
})

const STORAGE_KEY = 'worksync-active-session'

function inferRoleFromPath(pathname: string): Role {
  if (pathname.startsWith('/employer')) return 'employer'
  if (pathname.startsWith('/trainee')) return 'trainee'
  return 'admin'
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize from sessionStorage cache synchronously on client to avoid ANY flash
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as SessionInfo
        if (parsed && parsed.role) {
          setSession(parsed)
          setLoading(false)
        }
      }
    } catch {
      // Ignore sessionStorage issues
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setSession(data.user)
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
          } catch {
            // Ignore
          }
        } else {
          setSession(null)
          try {
            sessionStorage.removeItem(STORAGE_KEY)
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const setSessionUser = useCallback((user: SessionInfo | null) => {
    setSession(user)
    try {
      if (user) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Ignore
    }
  }, [])

  // If session is still loading and no cache exists, infer from pathname rather than hardcoding 'admin'
  const currentRole: Role = session?.role || inferRoleFromPath(pathname || '')

  return (
    <SessionContext.Provider
      value={{
        session,
        role: currentRole,
        loading,
        refreshSession,
        setSessionUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  return useContext(SessionContext)
}
