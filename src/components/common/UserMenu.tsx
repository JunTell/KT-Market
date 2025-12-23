'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/src/hooks/useAuth'
import type { User } from '@supabase/supabase-js'
import { AdminButton } from '../common/AdminButton'

interface UserMenuProps {
  initialUser: User | null
  initialIsAdmin: boolean
}

export function UserMenu({ initialUser, initialIsAdmin }: UserMenuProps) {
  const { user, isAdmin, isAuthenticated, loading, profile, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. 하이드레이션 전에는 서버 데이터를 사용, 후에는 클라이언트 상태 사용
  const currentUser = mounted ? user : initialUser
  // 프로필이 실제로 로드될 때까지 initialIsAdmin 사용
  const currentIsAdmin = mounted && profile !== null ? isAdmin : initialIsAdmin
  const isAuth = mounted ? isAuthenticated : !!initialUser

  // 로딩 중일 때 깜빡임 방지
  if (mounted && loading && !initialUser) {
    return <div className="text-sm text-label-500">로딩 중...</div>
  }

  if (!isAuth) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login" className="text-sm font-medium text-label-700 cursor-pointer">로그인</Link>
        <Link href="/signup" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-secondary transition-colors">회원가입</Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {/* 관리자 버튼 노출 조건 */}
      {currentIsAdmin && <AdminButton />}
      
      <span className="text-sm text-label-700">{currentUser?.email}</span>
      <button
        onClick={logout}
        className="rounded-md bg-label-100 px-4 py-2 text-sm font-medium text-label-900 cursor-pointer hover:bg-gray-200 transition-colors"
      >
        로그아웃
      </button>
    </div>
  )
}