'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/src/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push(redirectTo)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white text-black">
      <div className="w-full max-w-md">

        {/* 탭 영역 - 기업회원만 활성 */}
        <div className="flex border-b border-gray-300 mb-6">
          <h2 className="text-2xl font-semibold text-center">로그인</h2>
        </div>

        {/* 입력폼 */}
        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="아이디"
            className="w-full border rounded px-3 py-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="비밀번호"
            className="w-full border rounded px-3 py-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 체크박스 */}
          <div className="flex items-center gap-6 text-sm mt-1">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              로그인 유지
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              아이디 저장
            </label>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded py-3 font-semibold mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 에러 */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* 아이디/비번 찾기 */}
          <div className="flex gap-3 text-sm text-gray-500 mt-2">
            <span>아이디 찾기</span>
            <span>|</span>
            <span>비밀번호 찾기</span>
          </div>
        </form>

        {/* 소셜 로그인 */}
        <div className="mt-10">
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">소셜 계정으로 간편 로그인</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <div className="flex justify-center gap-5">
            {/* Kakao */}
            <button
              type="button"
              onClick={() =>
                supabaseClient.auth.signInWithOAuth({
                  provider: 'kakao',
                  options: {
                    redirectTo,
                    scopes: 'account_email',
                  },
                })
              }
            >
              <img src="/icons/kakao.svg" className="w-12 h-12" />
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() =>
                supabaseClient.auth.signInWithOAuth({
                  provider: 'google',
                })
              }
            >
              <img src="/icons/google.svg" className="w-12 h-12" />
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  )
}