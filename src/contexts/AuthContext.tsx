'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * 전역 인증 상태 Provider
 *
 * 사용법:
 * 1. layout.tsx에서 앱 전체를 감싸기
 * 2. 컴포넌트에서 useAuthContext() 훅으로 사용
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

/**
 * 인증 컨텍스트 사용 Hook
 *
 * @example
 * const { user, isAuthenticated, logout } = useAuthContext()
 */
export function useAuthContext() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return context
}
