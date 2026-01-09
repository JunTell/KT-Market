'use client'

import { useAuth } from '@/src/shared/hooks/useAuth'

/**
 * 사용자 프로필 컴포넌트 예시
 *
 * useAuth hook을 사용하여 전역 인증 상태에 접근
 */
export function UserProfile() {
  const { user, profile, loading, isAuthenticated, isAdmin, logout } =
    useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">로그인이 필요합니다.</p>
        <a
          href="/login"
          className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          로그인
        </a>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">사용자 프로필</h2>

      <div className="space-y-2 mb-4">
        <p>
          <span className="font-semibold">이메일:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold">사용자 ID:</span> {user.id}
        </p>
        {profile && (
          <>
            <p>
              <span className="font-semibold">관리자 권한:</span>{' '}
              {profile.is_admin ? '있음' : '없음'}
            </p>
            {isAdmin && (
              <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                관리자
              </span>
            )}
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        로그아웃
      </button>
    </div>
  )
}
