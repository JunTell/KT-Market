'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/src/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setLoading(true)

      // Supabase Auth 이메일/비밀번호 회원가입
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // 선택: profiles 테이블에 기본 role=user 프로필 생성 시도
      if (data.user) {
        await supabaseClient.from('profiles').upsert(
          {
            id: data.user.id,
            role: 'user',
          },
          { onConflict: 'id' }
        )
      }

      setMessage('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
      setTimeout(() => {
        router.push('/login')
      }, 1200)
    } catch (err: any) {
      setError(err?.message ?? '회원가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white text-black">
      <div className="w-full max-w-md">
        {/* 탭 영역 - 기업회원만 활성 */}
        <div className="flex border-b border-gray-300 mb-6">
          <h2 className='text-2xl font-semibold text-center'>개인회원</h2>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            className="w-full border rounded px-3 py-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            className="w-full border rounded px-3 py-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="비밀번호 확인"
            className="w-full border rounded px-3 py-3 text-sm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded py-3 font-semibold mt-2 disabled:opacity-60"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {message && <p className="text-green-600 text-sm mt-1">{message}</p>}

          <div className="flex gap-3 text-sm text-gray-500 mt-4">
            <span>이미 계정이 있으신가요?</span>
            <button
              type="button"
              className="underline"
              onClick={() => router.push('/login')}
            >
              로그인 하러가기
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
