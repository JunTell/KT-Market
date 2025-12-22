'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/src/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

/**
 * 클라이언트 사이드 인증 상태 관리 Hook
 *
 * 기능:
 * - 로그인/로그아웃 상태 추적
 * - 세션 토큰 자동 갱신
 * - 사용자 프로필 정보 관리
 * - 관리자 권한 확인
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
  })

  useEffect(() => {
    // 초기 세션 확인
    checkSession()

    // 안전장치: 10초 후에도 로딩 중이면 강제로 false로 설정
    const timeout = setTimeout(() => {
      setAuthState((prev) => {
        if (prev.loading) {
          console.warn('[useAuth] ⏰ 타임아웃: 10초 경과, 강제로 loading을 false로 설정')
          return { ...prev, loading: false }
        }
        return prev
      })
    }, 10000)

    // 인증 상태 변경 리스너 등록
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuth] 🔄 Auth state changed:', event)

      if (session) {
        await updateAuthState(session)
      } else {
        // 로그아웃 시 상태 초기화
        console.log('[useAuth] 🚪 Logging out, clearing state')
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          isAuthenticated: false,
          isAdmin: false,
        })
      }
    })

    // 클린업 함수
    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  /**
   * 현재 세션 확인
   */
  async function checkSession() {
    console.log('[useAuth] 🔍 초기 세션 확인 시작')

    try {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession()

      if (error) {
        console.error('[useAuth] ❌ 세션 확인 에러:', error)
        setAuthState((prev) => ({ ...prev, loading: false }))
        return
      }

      if (session) {
        console.log('[useAuth] ✅ 세션 발견, 프로필 로드 중...')
        await updateAuthState(session)
      } else {
        console.log('[useAuth] ℹ️ 세션 없음 (로그아웃 상태)')
        setAuthState((prev) => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('[useAuth] ❌ 세션 확인 중 예외:', error)
      setAuthState((prev) => ({ ...prev, loading: false }))
    }
  }

  /**
   * 세션 정보로 인증 상태 업데이트
   */
  async function updateAuthState(session: Session) {
    console.log('[useAuth] Updating auth state for user:', session.user.email)

    try {
      // 프로필 정보 조회
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('[useAuth] ❌ Error fetching profile:', profileError)
        console.warn('[useAuth] ⚠️ 프로필을 가져올 수 없습니다. RLS 정책을 확인하세요.')
        console.warn('[useAuth] ⚠️ 인증 상태는 유지되지만 프로필 정보는 없습니다.')

        // 프로필 로드 실패해도 인증 상태는 설정
        setAuthState({
          user: session.user,
          profile: null,
          session,
          loading: false,
          isAuthenticated: true,
          isAdmin: false,
        })
        return
      }

      console.log('[useAuth] ✅ Profile loaded:', profile)
      console.log('[useAuth] ✅ isAuthenticated: true, isAdmin:', profile?.is_admin === true)

      setAuthState({
        user: session.user,
        profile: profile || null,
        session,
        loading: false,
        isAuthenticated: true,
        isAdmin: profile?.is_admin === true,
      })
    } catch (error) {
      console.error('[useAuth] ❌ Unexpected error updating auth state:', error)

      // 에러 발생해도 반드시 loading을 false로 설정
      setAuthState({
        user: session.user,
        profile: null,
        session,
        loading: false,
        isAuthenticated: true,
        isAdmin: false,
      })
    }
  }

  /**
   * 로그아웃
   */
  async function logout() {
    try {
      // API 엔드포인트를 통해 로그아웃 (서버 쿠키 제거)
      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      // 클라이언트 세션도 제거
      await supabaseClient.auth.signOut()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  /**
   * 토큰 수동 갱신
   */
  async function refreshToken() {
    try {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.refreshSession()

      if (error) {
        console.error('Error refreshing token:', error)
        return false
      }

      if (session) {
        await updateAuthState(session)
        return true
      }

      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    }
  }

  return {
    ...authState,
    logout,
    refreshToken,
    checkSession,
  }
}
