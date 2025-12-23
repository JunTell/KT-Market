'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabaseClient } from '@/src/lib/supabase/client'
import { useUserStore } from '@/src/stores/useUserStore'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  is_admin: boolean
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
}

export function useAuth() {
  const setUserStore = useUserStore((state) => state.setUser)
  const clearUserStore = useUserStore((state) => state.clearUser)

  const [authState, setAuthState] = useState<AuthState>({
    user: null, profile: null, session: null,
    loading: true, isAuthenticated: false, isAdmin: false,
  })

  // 상태 업데이트 핵심 로직
  const updateAuthState = useCallback(async (session: Session | null) => {
    if (!session) {
      setAuthState({
        user: null, profile: null, session: null,
        loading: false, isAuthenticated: false, isAdmin: false,
      })
      clearUserStore()
      return
    }

    // 1단계: 유저 정보 즉시 반영 (로딩 해제 및 이메일 표시)
    setAuthState(prev => ({
      ...prev,
      user: session.user,
      session: session,
      isAuthenticated: true,
      loading: false, // 여기서 로딩을 먼저 풀어야 버튼 판단 로직이 작동함
    }))

    try {
      // 2단계: 프로필(관리자 여부) 조회
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      const isAdmin = profile?.is_admin === true

      // Zustand와 내부 State를 동시에 업데이트
      const userData = {
        id: session.user.id,
        email: session.user.email ?? '',
        isAdmin: isAdmin,
      }

      setUserStore(userData)
      setAuthState(prev => ({
        ...prev,
        profile: profile || null,
        isAdmin: isAdmin,
      }))
    } catch (error) {
      console.error('[useAuth] Profile fetch error:', error)
      // 프로필 조회 실패 시에도 기본 프로필 설정하여 로드 완료 표시
      const defaultProfile: Profile = {
        id: session.user.id,
        email: session.user.email ?? '',
        is_admin: false,
      }
      setAuthState(prev => ({
        ...prev,
        profile: defaultProfile,
        isAdmin: false,
      }))
      setUserStore({
        id: session.user.id,
        email: session.user.email ?? '',
        isAdmin: false,
      })
    }
  }, [setUserStore, clearUserStore])

  useEffect(() => {
    // 초기 세션 로드
    const init = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      await updateAuthState(session)
    }
    init()

    // 인증 상태 변경 리스너 (카카오 로그인 등 대응)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          await updateAuthState(null)
        } else if (session) {
          await updateAuthState(session)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [updateAuthState])

  const logout = useCallback(async () => {
    console.log('[Logout] 로그아웃 시작')

    try {
      // 1. 즉시 로컬 상태 초기화 (UI 즉시 반영)
      clearUserStore()
      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
      })

      // 2. 클라이언트 사이드 Supabase 세션 종료
      const { error: signOutError } = await supabaseClient.auth.signOut()
      if (signOutError) {
        console.error('[Logout] 클라이언트 로그아웃 에러:', signOutError)
      }

      // 3. 서버 사이드 로그아웃 API 호출 (쿠키 제거)
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' })
        if (!res.ok) {
          console.warn('[Logout] 서버 로그아웃 응답 에러:', res.status)
        }
      } catch (fetchError) {
        console.warn('[Logout] 서버 로그아웃 요청 실패:', fetchError)
      }

      // 4. 페이지 강제 리로드 및 이동
      console.log('[Logout] 로그인 페이지로 이동')
      window.location.replace('/login')
    } catch (error) {
      console.error('[Logout] 로그아웃 처리 중 예상치 못한 오류:', error)
      // 오류가 발생해도 로그인 페이지로 이동
      clearUserStore()
      window.location.replace('/login')
    }
  }, [clearUserStore])

  return { ...authState, logout }
}