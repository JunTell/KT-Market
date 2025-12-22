'use client'

import Link from 'next/link'
import { useAuthContext } from '@/src/contexts/AuthContext'
import { AdminButton } from './AdminButton'

export function Header() {
  const { user, isAuthenticated, loading, logout } = useAuthContext()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line-200 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-primary">KT Market</div>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/products"
            className="text-label-700 hover:text-label-900 transition-colors"
          >
            상품
          </Link>
          <Link
            href="/events"
            className="text-label-700 hover:text-label-900 transition-colors"
          >
            이벤트
          </Link>
          <Link
            href="/about"
            className="text-label-700 hover:text-label-900 transition-colors"
          >
            소개
          </Link>
        </nav>

        {/* 사용자 메뉴 */}
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="text-sm text-label-500">로딩 중...</div>
          ) : isAuthenticated ? (
            <>
              {/* 관리자 버튼 (is_admin이 true일 때만 표시) */}
              <AdminButton />

              <span className="text-sm text-label-700">{user?.email}</span>
              <button
                onClick={async () => {
                  await logout()
                  window.location.href = '/'
                }}
                className="rounded-md bg-label-100 px-4 py-2 text-sm font-medium text-label-900 hover:bg-label-100/80 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-label-700 hover:text-label-900 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-secondary transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
