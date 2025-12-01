'use client'

import { useUserStore } from '@/src/stores/useUserStore'

export default function HomePage() {
  const { user, setUser, logout } = useUserStore()

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">KT Market</h1>
      {user ? (
        <>
          <p>안녕하세요, {user.name}님</p>
          <button onClick={logout}>로그아웃</button>
        </>
      ) : (
        <button
          onClick={() => setUser({ id: '1', name: '테스트 유저' })}
        >
          로그인 된 것처럼 설정
        </button>
      )}
    </main>
  )
}