'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useAuth } from '@/src/shared/hooks/useAuth'

import { AdminButton } from '../common/AdminButton'

import type { User } from '@supabase/supabase-js'

interface UserMenuProps {
  initialUser: User | null
  initialIsAdmin: boolean
}

export function UserMenu({ initialUser, initialIsAdmin }: UserMenuProps) {
  const { user, isAdmin, isAuthenticated, loading, profile, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // 1. 하이드레이션 전( mounted=false )이거나, 아직 인증 로딩 중( loading=true )인 경우
  // 서버에서 받아온 initialUser를 우선 보여주어 "깜빡임(Flash)"을 방지합니다.
  const shouldUseInitial = !mounted || (loading && !!initialUser)

  const currentUser = shouldUseInitial ? initialUser : user
  const currentIsAdmin = shouldUseInitial ? initialIsAdmin : (isAdmin && profile !== null)
  const isAuth = shouldUseInitial ? !!initialUser : isAuthenticated

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