'use client'

import { useState } from 'react'

import { logout } from '@/src/shared/actions/auth'

/**
 * 로그아웃 버튼 컴포넌트
 *
 * Server Action을 사용한 로그아웃 처리:
 * - Server Action (signOut)이 서버에서 쿠키 삭제
 * - 자동으로 로그인 페이지로 리다이렉트
 */
export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="text-xs px-3 py-1.5 border border-white/20 rounded hover:bg-white/5 disabled:opacity-50"
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}
