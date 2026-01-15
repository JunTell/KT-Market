'use client'

import { useCallback } from 'react'

import { supabaseClient } from '@/src/shared/lib/supabase/client'
import { useUserStore } from '@/src/shared/stores/useUserStore'

import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  is_admin: boolean
}

// 기존 AuthState 인터페이스 유지 (호환성)
interface AuthState {
  user: User | null
  profile: Profile | null
  session: any | null // 세션은 이제 스토어에서 직접 관리하지 않거나 필요시 추가
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

export function useAuth() {
  // 전역 스토어에서 데이터 구독
  const { user: storeUser, isLoading, clearUser } = useUserStore()

  // 스토어 데이터를 기존 훅 인터페이스에 맞게 매핑
  const isAuthenticated = !!storeUser
  const isAdmin = storeUser?.isAdmin ?? false

  // 호환성을 위한 Profile 객체 구성
  const profile: Profile | null = storeUser ? {
    id: storeUser.id,
    email: storeUser.email,
    is_admin: storeUser.isAdmin
  } : null

  // 호환성을 위한 User 객체 구성 (Supabase User 타입 흉내)
  const user: User | null = storeUser ? {
    id: storeUser.id,
    email: storeUser.email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User : null

  const logout = useCallback(async () => {
    console.log('[Logout] 로그아웃 시작')

    try {
      // 1. 즉시 로컬 상태 초기화
      clearUser()

      // 2. 클라이언트 사이드 Supabase 세션 종료
      await supabaseClient.auth.signOut()

      // 3. 서버 사이드 로그아웃 API 호출
      await fetch('/api/auth/logout', { method: 'POST' })

      // 4. 페이지 이동 (AuthStateListener가 감지하여 처리할 수도 있지만, 명시적 이동)
      window.location.replace('/login')
    } catch (error) {
      console.error('[Logout] 로그아웃 에러:', error)
      window.location.replace('/login')
    }
  }, [clearUser])

  return {
    user,
    profile,
    session: null, // 세션 객체는 이제 불필요하거나 스토어 확장 필요
    loading: isLoading,
    isAuthenticated,
    isAdmin,
    logout
  }
}