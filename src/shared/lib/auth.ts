import { supabaseClient } from './supabase/client'

import type { Session } from '@supabase/supabase-js'

/**
 * 인증 관련 유틸리티 함수
 */

/**
 * 로컬스토리지에 로그인 유지 설정 저장
 */
export function setRememberMe(remember: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rememberMe', remember.toString())
  }
}

/**
 * 로그인 유지 설정 가져오기
 */
export function getRememberMe(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rememberMe') === 'true'
  }
  return false
}

/**
 * 로컬스토리지에 이메일 저장 (아이디 저장 기능)
 */
export function setSavedEmail(email: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('savedEmail', email)
  }
}

/**
 * 저장된 이메일 가져오기
 */
export function getSavedEmail(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('savedEmail') || ''
  }
  return ''
}

/**
 * 저장된 이메일 삭제
 */
export function clearSavedEmail() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('savedEmail')
  }
}

/**
 * 세션 토큰 정보 가져오기
 */
export async function getSessionToken(): Promise<{
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}> {
  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      return {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at || null,
    }
  } catch (error) {
    console.error('Error getting session token:', error)
    return {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    }
  }
}

/**
 * 토큰 만료 여부 확인
 */
export function isTokenExpired(expiresAt: number | null): boolean {
  if (!expiresAt) return true

  // 현재 시간(초)
  const now = Math.floor(Date.now() / 1000)

  // 5분 전에 만료로 간주 (자동 갱신을 위해)
  const bufferTime = 5 * 60

  return now >= expiresAt - bufferTime
}

/**
 * 세션 유효성 검증
 */
export async function validateSession(): Promise<boolean> {
  try {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser()

    if (error || !user) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating session:', error)
    return false
  }
}

/**
 * 토큰 갱신
 */
export async function refreshSessionToken(): Promise<Session | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.refreshSession()

    if (error || !session) {
      console.error('Error refreshing session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Error refreshing session:', error)
    return null
  }
}

/**
 * 로그인 with 이메일/비밀번호
 */
export async function signInWithEmail(
  email: string,
  password: string,
  rememberMe: boolean = false
) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message, data: null }
    }

    // 로그인 유지 설정 저장
    setRememberMe(rememberMe)

    return { success: true, error: null, data }
  } catch (error) {
    return {
      success: false,
      error: '로그인 중 오류가 발생했습니다.',
      data: null,
    }
  }
}

/**
 * 로그아웃
 */
export async function signOut() {
  try {
    // API 엔드포인트를 통해 로그아웃 (서버 쿠키 제거)
    await fetch('/api/auth/logout', {
      method: 'POST',
    })

    // 클라이언트 세션도 제거
    await supabaseClient.auth.signOut()

    // 로그인 유지 설정 삭제 (선택사항)
    // setRememberMe(false)

    return { success: true, error: null }
  } catch (error) {
    console.error('Error during logout:', error)
    return {
      success: false,
      error: '로그아웃 중 오류가 발생했습니다.',
    }
  }
}

/**
 * 현재 사용자 프로필 가져오기
 */
export async function getCurrentUserProfile() {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.', data: null }
    }

    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return { success: false, error: error.message, data: null }
    }

    return { success: true, error: null, data: { user, profile } }
  } catch (error) {
    return {
      success: false,
      error: '프로필을 가져오는 중 오류가 발생했습니다.',
      data: null,
    }
  }
}

/**
 * 관리자 권한 확인
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const result = await getCurrentUserProfile()

    if (!result.success || !result.data) {
      return false
    }

    return result.data.profile?.is_admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
